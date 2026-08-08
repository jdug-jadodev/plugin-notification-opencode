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
const globalImagePath = join(verifyDir, "global.png");
const errorImagePath = join(verifyDir, "error.png");
const invalidImagePath = join(verifyDir, "invalid.png");
const corruptImagePath = join(verifyDir, "corrupt.png");

function pngHeader(width: number, height: number): Buffer {
  const header = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(header);
  header.writeUInt32BE(13, 8);
  header.write("IHDR", 12, "ascii");
  header.writeUInt32BE(width, 16);
  header.writeUInt32BE(height, 20);
  return header;
}

await writeFile(globalImagePath, pngHeader(64, 64));
await writeFile(errorImagePath, pngHeader(64, 64));
await writeFile(invalidImagePath, pngHeader(32, 32));
await writeFile(corruptImagePath, "not a PNG");

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
      image: { enabled: true, path: "./global.png", position: "right" },
      events: {
        error: { blinkColors: ["#7F1D1D", "#EF4444"], image: { path: "./error.png", position: "left" } },
        permission: { image: { enabled: false } },
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

console.log("-- MessageAbortedError es silencioso --");
const lifecycleEvents: EventType[] = [];
const lifecycleController = new EventController({
  async handle(event) {
    lifecycleEvents.push(event.type);
  },
});
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-busy-aborted",
  type: "session.status",
  properties: { sessionID: "main", status: { type: "busy" } },
} satisfies Event);
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-error",
  type: "session.error",
  properties: { error: { name: "MessageAbortedError", data: { message: "Aborted" } } },
} satisfies Event);
const abortedAssistant = {
  id: "msg-aborted",
  sessionID: "main",
  role: "assistant",
  time: { created: 1, completed: 2 },
  error: { name: "MessageAbortedError", data: { message: "Aborted" } },
  parentID: "msg-user",
  modelID: "test-model",
  providerID: "test-provider",
  mode: "build",
  agent: "build",
  path: { cwd: verifyDir, root: verifyDir },
  cost: 0,
  tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
} as const;
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-message-aborted",
  type: "message.updated",
  properties: { sessionID: "main", info: abortedAssistant },
} satisfies Event);
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-idle",
  type: "session.idle",
  properties: { sessionID: "main" },
} satisfies Event);
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-idle-duplicate",
  type: "session.idle",
  properties: { sessionID: "main" },
} satisfies Event);
check(lifecycleEvents.length === 0, "aborto sin sessionID y sus idle duplicados no notifican");

console.log("-- una nueva ejecución permite complete --");
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-busy",
  type: "session.status",
  properties: { sessionID: "main", status: { type: "busy" } },
} satisfies Event);
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-idle-late",
  type: "session.idle",
  properties: { sessionID: "main" },
} satisfies Event);
check(lifecycleEvents.length === 0, "idle tardío durante la ejecución nueva sigue bloqueado");
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-message-complete",
  type: "message.updated",
  properties: {
    sessionID: "main",
    info: { ...abortedAssistant, id: "msg-complete", time: { created: 3, completed: 4 }, error: undefined },
  },
} satisfies Event);
await lifecycleController.onSdkEvent({
  id: "evt-lifecycle-complete",
  type: "session.idle",
  properties: { sessionID: "main" },
} satisfies Event);
check(
  lifecycleEvents.length === 1 && lifecycleEvents[0] === EventType.Complete,
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
check(loadedConfig.popup.image.path === globalImagePath, "ruta PNG global se resuelve desde notify.json");
check(loadedConfig.popup.events.error?.image?.path === errorImagePath, "ruta PNG por evento se resuelve desde notify.json");
const popupAdapter = new NativePersistentPopup(new JsonConfigLoader(mainConfigPath), "win32") as unknown as {
  env(message: NotificationMessage): Promise<NodeJS.ProcessEnv>;
  style(message: NotificationMessage): Promise<{
    blinkColors: string[];
    textColor: string;
    fontSize: number;
    image: { enabled: boolean; path?: string; position: string };
  }>;
};
const resolvedErrorStyle = await popupAdapter.style({ kind: EventType.Error, title: "Error", message: "falló" });
check(resolvedErrorStyle.blinkColors[0] === "#7F1D1D", "popup aplica colores del evento");
check(resolvedErrorStyle.textColor === "#FFFFFF" && resolvedErrorStyle.fontSize === 13, "override hereda estilo global");
check(
  resolvedErrorStyle.image.enabled &&
    resolvedErrorStyle.image.path === errorImagePath &&
    resolvedErrorStyle.image.position === "left",
  "imagen por evento hereda enabled y reemplaza ruta y posición",
);
const resolvedQuestionStyle = await popupAdapter.style({ kind: EventType.Question, title: "Pregunta", message: "respuesta" });
check(
  resolvedQuestionStyle.image.enabled && resolvedQuestionStyle.image.path === globalImagePath,
  "evento sin imagen propia utiliza la imagen global",
);
const resolvedPermissionStyle = await popupAdapter.style({
  kind: EventType.Permission,
  title: "Permiso",
  message: "write",
});
check(!resolvedPermissionStyle.image.enabled, "evento puede desactivar la imagen global");
const popupEnv = await popupAdapter.env({ kind: EventType.Error, title: "Error", message: "falló" });
check(popupEnv.POPUP_IMAGE_PATH === errorImagePath, "fallback recibe la ruta PNG validada");

const imageWarnings: string[] = [];
async function invalidImageStyle(path: string, position = "left"): Promise<{ enabled: boolean; position: string }> {
  const configPath = join(verifyDir, `notify-invalid-image-${imageWarnings.length}.json`);
  await writeFile(configPath, JSON.stringify({ popup: { image: { enabled: true, path, position } } }));
  const adapter = new NativePersistentPopup(new JsonConfigLoader(configPath), "win32", undefined, {
    debug: () => {},
    info: () => {},
    warn: (warning) => imageWarnings.push(warning),
    error: () => {},
  }) as unknown as {
    style(message: NotificationMessage): Promise<{ image: { enabled: boolean; position: string } }>;
  };
  return (await adapter.style({ kind: EventType.Complete, title: "OpenCode", message: "listo" })).image;
}

const invalidImageStyleResult = await invalidImageStyle("./invalid.png", "sideways");
check(!invalidImageStyleResult.enabled, "PNG con dimensiones inválidas conserva popup sin imagen");
check(invalidImageStyleResult.position === "left", "posición PNG inválida usa left");
check(imageWarnings.some((warning) => warning.includes("expected 64x64")), "PNG inválido registra advertencia");
const warningCount = imageWarnings.length;
check(!(await invalidImageStyle("./missing.png")).enabled, "PNG inexistente conserva popup sin imagen");
check(!(await invalidImageStyle("./image.jpg")).enabled, "extensión no PNG conserva popup sin imagen");
check(!(await invalidImageStyle("./corrupt.png")).enabled, "firma PNG corrupta conserva popup sin imagen");
check(imageWarnings.length === warningCount + 3, "cada imagen rechazada registra advertencia");
check(
  imageWarnings.some((warning) => warning.includes("only PNG files")) &&
    imageWarnings.some((warning) => warning.includes("invalid PNG header")),
  "archivos no PNG registran advertencia",
);
const defaults = await new JsonConfigLoader(join(verifyDir, "missing.json")).get();
check(defaults.events.complete.sound, "sonido viene activo por defecto");
check(!defaults.popup.image.enabled && defaults.popup.image.position === "left", "imagen popup viene desactivada por defecto");

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
check(
  LINUX_POPUP_PY.includes("tk.PhotoImage") && LINUX_POPUP_PY.includes("image_position") && LINUX_POPUP_PY.includes("64"),
  "popup Tkinter carga PNG 64x64 a izquierda o derecha",
);
check(LINUX_POPUP_SH.includes("zenity") && LINUX_POPUP_SH.includes("notify-send"), "popup Linux tiene fallbacks");
check(
  LINUX_POPUP_SH.includes("--window-icon") && LINUX_POPUP_SH.includes("notify-send -u critical -t 0 -i"),
  "fallbacks Linux reciben el PNG como icono",
);
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
let popupActivations = 0;
const windowsPopup = new NativePersistentPopup(undefined, "win32", () => {
  popupActivations += 1;
}) as unknown as {
  active: object | undefined;
  command(message: NotificationMessage): string[];
  onExit(child: object, code: number): void;
  windowsScript(): string;
};
const popupScript = windowsPopup.windowsScript();
check(
  popupScript.includes("Add-Type -ReferencedAssemblies System.Windows.Forms,System.Drawing"),
  "popup referencia WinForms al compilar NoActivateForm",
);
check(
  popupScript.includes("System.Windows.Forms.PictureBox") &&
    popupScript.includes("System.Drawing.Image]::FromFile") &&
    popupScript.includes("$picture.Add_Click"),
  "popup Windows muestra PNG y conserva activación por clic",
);
check(popupScript.includes("$picture.Image.Dispose()"), "popup Windows libera la imagen al cerrar");
check(popupScript.includes("$script:activated = $true") && popupScript.includes("exit 10"), "popup señala el clic");
const fakePopupChild = {};
windowsPopup.active = fakePopupChild;
windowsPopup.onExit(fakePopupChild, 10);
check(popupActivations === 1, "clic del popup activa el cierre del toast");
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
