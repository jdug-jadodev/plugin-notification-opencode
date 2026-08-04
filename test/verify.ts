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
import { LINUX_POPUP_PY, LINUX_POPUP_SH } from "../src/helpers/linux/popup.js";
import { LINUX_DEFAULT_SOUND_SH, LINUX_FILE_SOUND_SH } from "../src/helpers/linux/sound.js";
import { FOCUS_TERMINAL_PS, NOACTIVATE_FORM_CS, WAIT_FOR_TERMINAL_FOCUS_PS } from "../src/helpers/win32/terminal.js";
import { JsonConfigLoader } from "../src/infrastructure/adapter/JsonConfigLoader.js";
import { NativePersistentPopup } from "../src/infrastructure/adapter/NativePersistentPopup.js";
import { NativeSoundPlayer } from "../src/infrastructure/adapter/NativeSoundPlayer.js";
import { NativeTerminalFocuser } from "../src/infrastructure/adapter/NativeTerminalFocuser.js";
import { NativeTerminalFocusWatcher } from "../src/infrastructure/adapter/NativeTerminalFocusWatcher.js";
import { NodeNotifierMapper } from "../src/infrastructure/adapter/mapper/NodeNotifierMapper.js";
import { OpenCodeEventMapper } from "../src/infrastructure/adapter/mapper/OpenCodeEventMapper.js";
import { DEFAULT_NOTIFY_CONFIG } from "../src/infrastructure/config/defaultNotifyConfig.js";
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

const verifyDir = await mkdtemp(join(tmpdir(), "opencode-desktop-notify-verify-"));
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
    popup: {
      blinkColors: ["#101820"],
      textColor: "#FFFFFF",
      fontSize: 13,
      events: {
        error: { blinkColors: ["#7F1D1D", "#EF4444"] },
      },
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
check(popup.shown[0]?.kind === EventType.Permission, "mensaje conserva el tipo de evento");

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

console.log("-- session.error seguido de session.idle --");
await controller.onSdkEvent({ id: "evt-3-idle", type: "session.idle", properties: { sessionID: "main" } } satisfies Event);
check(popup.shown.length === 3, "idle posterior al error no duplica la notificación");

console.log("-- una nueva ejecución permite complete --");
const lifecycleEvents: EventType[] = [];
const lifecycleController = new EventController({
  async handle(event) {
    lifecycleEvents.push(event.type);
  },
});
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-error",
  type: "session.error",
  properties: { sessionID: "main", error: { name: "MessageAbortedError", data: { message: "Aborted" } } },
} satisfies Event);
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-idle",
  type: "session.idle",
  properties: { sessionID: "main" },
} satisfies Event);
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-busy",
  type: "session.status",
  properties: { sessionID: "main", status: { type: "busy" } },
} satisfies Event);
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-complete",
  type: "session.idle",
  properties: { sessionID: "main" },
} satisfies Event);
check(
  lifecycleEvents.length === 2 && lifecycleEvents[0] === EventType.Error && lifecycleEvents[1] === EventType.Complete,
  "una ejecución nueva sí notifica complete",
);

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

console.log("-- estilos por evento --");
const loadedConfig = await new JsonConfigLoader(mainConfigPath).get();
check(loadedConfig.popup.events.error?.blinkColors?.[1] === "#EF4444", "config carga override de error");
const popupAdapter = new NativePersistentPopup(new JsonConfigLoader(mainConfigPath), "win32") as unknown as {
  style(message: NotificationMessage): Promise<{ blinkColors: string[]; textColor: string; fontSize: number }>;
};
const resolvedErrorStyle = await popupAdapter.style({ kind: EventType.Error, title: "Error", message: "falló" });
check(resolvedErrorStyle.blinkColors[0] === "#7F1D1D", "popup aplica colores del evento");
check(resolvedErrorStyle.textColor === "#FFFFFF" && resolvedErrorStyle.fontSize === 13, "override hereda estilo global");
const defaults = await new JsonConfigLoader(join(verifyDir, "missing.json")).get();
check(defaults.events.complete.sound, "sonido viene activo por defecto");

console.log("-- ciclo de vida del toast --");
const message: NotificationMessage = { kind: EventType.Complete, title: "OpenCode", message: "listo" };
const windowsToast = NodeNotifierMapper.toInfrastructure(message, DEFAULT_NOTIFY_CONFIG, "win32", 42);
check(windowsToast.id === 42 && windowsToast.wait === true, "toast Windows es persistente e identificable");
check(
  windowsToast.timeout === undefined && windowsToast.silent === true && windowsToast.appName === undefined,
  "toast Windows conserva appID, espera cierre explícito y es silencioso",
);
const linuxToast = NodeNotifierMapper.toInfrastructure(message, DEFAULT_NOTIFY_CONFIG, "linux");
check(linuxToast.wait === false && linuxToast.timeout === 5, "toast Linux es transitorio");
check(WAIT_FOR_TERMINAL_FOCUS_PS.includes("$wasAway"), "watcher espera salida y regreso a terminal");

console.log("-- backends Linux --");
check(LINUX_POPUP_PY.includes("import tkinter") && LINUX_POPUP_PY.includes("blinkColors"), "popup Tkinter usa estilos");
check(LINUX_POPUP_SH.includes("zenity") && LINUX_POPUP_SH.includes("notify-send"), "popup Linux tiene fallbacks");
check(
  LINUX_DEFAULT_SOUND_SH.includes("canberra-gtk-play") &&
    LINUX_DEFAULT_SOUND_SH.includes("paplay") &&
    LINUX_DEFAULT_SOUND_SH.includes("pw-play") &&
    LINUX_DEFAULT_SOUND_SH.includes("aplay"),
  "sonido Linux detecta backends",
);
const linuxPlayer = new NativeSoundPlayer("linux") as unknown as {
  command(sound: { kind: EventType; path?: string }): string[] | undefined;
};
const linuxFileCommand = linuxPlayer.command({ kind: EventType.Error, path: "/tmp/error.wav" });
check(linuxFileCommand?.[0] === "sh" && linuxFileCommand.at(-1) === "/tmp/error.wav", "archivo Linux no usa afplay");
check(LINUX_FILE_SOUND_SH.includes("ffplay"), "archivo Linux incluye fallback ffplay");

console.log("-- protecciones Win32 --");
check(NOACTIVATE_FORM_CS.includes("0x08000000"), "popup usa WS_EX_NOACTIVATE desde su creación");
check(FOCUS_TERMINAL_PS.includes("IsIconic"), "foco detecta terminal minimizada");
check(FOCUS_TERMINAL_PS.includes("ShowWindow($script:target, 9)"), "foco restaura con SW_RESTORE");
const windowsPopup = new NativePersistentPopup(undefined, "win32") as unknown as {
  command(message: NotificationMessage): string[];
  windowsScript(): string;
};
const popupScript = windowsPopup.windowsScript();
check(
  popupScript.includes("Add-Type -ReferencedAssemblies System.Windows.Forms,System.Drawing"),
  "popup referencia WinForms al compilar NoActivateForm",
);
const popupCommand = windowsPopup.command(message);
const focusCommand = (new NativeTerminalFocuser("win32") as unknown as { command(): string[] }).command();
const watcherCommand = (new NativeTerminalFocusWatcher("win32") as unknown as { command(): string[] }).command();
const soundCommand = (new NativeSoundPlayer("win32") as unknown as {
  command(sound: { kind: EventType }): string[];
}).command({ kind: EventType.Complete });
for (const [name, command] of [
  ["popup", popupCommand],
  ["focuser", focusCommand],
  ["watcher", watcherCommand],
  ["sound", soundCommand],
] as const) {
  check(!command.includes("-WindowStyle"), `${name} no modifica el estado de Windows Terminal`);
  check(command.includes("-NonInteractive"), `${name} usa PowerShell no interactivo`);
}

if (failures > 0) {
  console.error(`VERIFICACIÓN CON ${failures} FALLO(S)`);
  process.exit(1);
}
console.log("VERIFICACIÓN COMPLETA");
