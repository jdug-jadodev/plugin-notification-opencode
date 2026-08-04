import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Event } from "@opencode-ai/sdk/v2";
import { NotificationEventMapper } from "../src/application/mapper/NotificationEventMapper.js";
import { NotifyOnEventUseCase } from "../src/application/usecase/NotifyOnEventUseCase.js";
import type { NotificationMessage } from "../src/domain/entity/NotificationMessage.js";
import type { SessionInfo } from "../src/domain/entity/SessionInfo.js";
import { EventType } from "../src/domain/enum/EventType.js";
import type { Logger } from "../src/domain/port/out/Logger.js";
import type { NotificationSender } from "../src/domain/port/out/NotificationSender.js";
import type { PersistentPopup } from "../src/domain/port/out/PersistentPopup.js";
import type { SessionStore } from "../src/domain/port/out/SessionStore.js";
import type { SoundPlayer } from "../src/domain/port/out/SoundPlayer.js";
import type { TitleFlasher } from "../src/domain/port/out/TitleFlasher.js";
import { FOCUS_TERMINAL_PS, NOACTIVATE_FORM_CS } from "../src/helpers/win32/terminal.js";
import { JsonConfigLoader } from "../src/infrastructure/adapter/JsonConfigLoader.js";
import { NativePersistentPopup } from "../src/infrastructure/adapter/NativePersistentPopup.js";
import { OpenCodeEventMapper } from "../src/infrastructure/adapter/mapper/OpenCodeEventMapper.js";
import { EventController } from "../src/infrastructure/controller/EventController.js";

let failures = 0;

function check(condition: unknown, label: string): void {
  if (condition) {
    console.log(`  [ok] ${label}`);
  } else {
    failures += 1;
    console.error(`  [FAIL] ${label}`);
  }
}

const verifyDir = await mkdtemp(join(tmpdir(), "opencode-notify-verify-"));
const mainConfigPath = join(verifyDir, "notify.json");
const cooldownConfigPath = join(verifyDir, "notify-cooldown.json");

await writeFile(
  mainConfigPath,
  JSON.stringify({
    cooldownMs: 1200,
    onlyMainSessions: true,
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
    events: {
      complete: { system: true, sound: false, popup: true, titleFlash: false },
      error: { system: true, sound: false, popup: true, titleFlash: false },
      permission: { system: true, sound: false, popup: true, titleFlash: false },
      question: { system: true, sound: false, popup: true, titleFlash: false },
    },
    messages: {
      permission: { title: "🔔 opencode", message: "Permiso requerido: {details}" },
    },
  }),
);

await writeFile(
  cooldownConfigPath,
  JSON.stringify({
    cooldownMs: 1200,
    onlyMainSessions: true,
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
    events: {
      complete: { system: true, sound: false, popup: false, titleFlash: false },
    },
  }),
);

class MemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, SessionInfo>();

  async remember(info: SessionInfo): Promise<void> {
    this.sessions.set(info.id, info);
  }

  async get(sessionId: string): Promise<SessionInfo | undefined> {
    return this.sessions.get(sessionId);
  }
}

class CapturingSender implements NotificationSender {
  readonly sent: NotificationMessage[] = [];

  async send(message: NotificationMessage): Promise<void> {
    this.sent.push(message);
  }
}

class CapturingPopup implements PersistentPopup {
  readonly shown: NotificationMessage[] = [];

  async show(message: NotificationMessage): Promise<void> {
    this.shown.push(message);
  }
}

class NoopSoundPlayer implements SoundPlayer {
  async play(): Promise<void> {}
}

class NoopTitleFlasher implements TitleFlasher {
  async flash(): Promise<void> {}
}

const logger: Logger = {
  debug: (message) => console.log(`  [debug] ${message}`),
  info: (message) => console.log(`  [info] ${message}`),
  warn: (message) => console.log(`  [warn] ${message}`),
  error: (message) => console.log(`  [error] ${message}`),
};

const sessions = new MemorySessionStore();
await sessions.remember({ id: "main", title: "Mi sesión principal" });
await sessions.remember({ id: "sub", title: "Subagente", parentId: "main" });

const sender = new CapturingSender();
const popup = new CapturingPopup();
const handler = new NotifyOnEventUseCase(
  sender,
  new NoopSoundPlayer(),
  popup,
  new NoopTitleFlasher(),
  sessions,
  new JsonConfigLoader(mainConfigPath),
  logger,
);
const controller = new EventController(handler);

console.log("-- permission.asked (payload real opencode 1.18.11) --");
const permissionAsked: Event = {
  id: "evt-1",
  type: "permission.asked",
  properties: {
    id: "perm-1",
    sessionID: "main",
    permission: "write",
    patterns: ["C:/Users/Usuario/Documents/**"],
    metadata: {},
    always: [],
  },
};
const permissionDto = OpenCodeEventMapper.toDto(permissionAsked);
const mappedPermission = permissionDto ? NotificationEventMapper.toDomain(permissionDto) : undefined;
check(
  mappedPermission?.type === EventType.Permission && mappedPermission.permission === "write",
  "mapper v2 conserva el permiso solicitado",
);
await controller.onSdkEvent(permissionAsked);
check(sender.sent.length === 1, "toast disparado para permission.asked");
check(popup.shown.length === 1, "popup disparado para permission.asked");
check(popup.shown[0]?.message.includes("write"), "mensaje incluye el permiso solicitado");

console.log("-- session.idle → complete --");
await controller.onSdkEvent({ id: "evt-2", type: "session.idle", properties: { sessionID: "main" } } satisfies Event);
check(popup.shown.length === 2, "popup disparado para session.idle");

console.log("-- session.error --");
await controller.onSdkEvent({
  id: "evt-3",
  type: "session.error",
  properties: {
    sessionID: "main",
    error: { name: "APIError", data: { message: "API timeout", isRetryable: false } },
  },
} satisfies Event);
check(popup.shown.length === 3, "popup disparado para session.error");
check(sender.sent[2]?.message.includes("API timeout"), "error llega al mensaje");

console.log("-- evento desconocido se ignora --");
await controller.onSdkEvent({ id: "evt-4", type: "todo.updated", properties: { sessionID: "main", todos: [] } } satisfies Event);
check(popup.shown.length === 3, "todo.updated no notifica");

console.log("-- question vía tool.execute.before --");
await controller.onToolExecuteBefore("question", "main");
check(popup.shown.length === 4, "question notifica");

console.log("-- subagente (no debe notificar) --");
const subSender = new CapturingSender();
const subPopup = new CapturingPopup();
const subHandler = new NotifyOnEventUseCase(
  subSender,
  new NoopSoundPlayer(),
  subPopup,
  new NoopTitleFlasher(),
  sessions,
  new JsonConfigLoader(mainConfigPath),
  logger,
);
await subHandler.handle({ type: EventType.Complete, sessionId: "sub" });
check(subSender.sent.length === 0, "subagente no notifica");

console.log("-- cooldown: segundo complete inmediato no debe notificar --");
const cooldownSender = new CapturingSender();
const cooldownHandler = new NotifyOnEventUseCase(
  cooldownSender,
  new NoopSoundPlayer(),
  new CapturingPopup(),
  new NoopTitleFlasher(),
  sessions,
  new JsonConfigLoader(cooldownConfigPath),
  logger,
);
await cooldownHandler.handle({ type: EventType.Complete, sessionId: "main" });
await cooldownHandler.handle({ type: EventType.Complete, sessionId: "main" });
check(cooldownSender.sent.length === 1, "cooldown bloquea el segundo envío");

console.log("-- cooldown superado (espera 1.3s) --");
await new Promise((resolve) => setTimeout(resolve, 1300));
await cooldownHandler.handle({ type: EventType.Complete, sessionId: "main" });
check(cooldownSender.sent.length === 2, "cooldown superado vuelve a notificar");

console.log("-- protecciones Win32 --");
check(NOACTIVATE_FORM_CS.includes("0x08000000"), "popup usa WS_EX_NOACTIVATE desde su creación");
check(FOCUS_TERMINAL_PS.includes("IsIconic"), "foco detecta terminal minimizada");
check(FOCUS_TERMINAL_PS.includes("ShowWindow($script:target, 9)"), "foco restaura con SW_RESTORE");
const popupScript = (
  new NativePersistentPopup(undefined, "win32") as unknown as { windowsScript(): string }
).windowsScript();
check(
  popupScript.includes("Add-Type -ReferencedAssemblies System.Windows.Forms,System.Drawing"),
  "popup referencia WinForms al compilar NoActivateForm",
);

if (failures > 0) {
  console.error(`VERIFICACIÓN CON ${failures} FALLO(S)`);
  process.exit(1);
}
console.log("VERIFICACIÓN COMPLETA");
