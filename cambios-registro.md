# 📊 Registro de Cambios con Estadísticas
**Iniciado:** 4/8/2026, 11:29:42 a. m.
**Proyecto:** C:\Users\Usuario\Documents\notificaciones-opencode
**Formato:** Archivos nuevos, modificados y eliminados
**Estado:** Monitoreando cambios no commiteados


## 🕐 04/08/2026, 11:29:43

### 📊 Resumen
- **Total archivos:** 30
- **📝 Nuevos:** 8
- **✏️ Modificados:** 22
- **🗑️ Eliminados:** 0
- **Líneas añadidas:** +318
- **Líneas eliminadas:** -66
- **Balance neto:** +252 líneas

### 📝 Detalle por archivo

| Estado | Archivo | Añadidas | Eliminadas | Neto |
|--------|---------|----------|------------|------|
| 🆕 | `CHANGELOG.md` | nuevo | -0 | 0 |
| 🆕 | `monitor.cjs` | nuevo | -0 | 0 |
| 🆕 | `src/domain/entity/PopupStyle.ts` | nuevo | -0 | 0 |
| 🆕 | `src/domain/port/out/TerminalFocusWatcher.ts` | nuevo | -0 | 0 |
| 🆕 | `src/helpers/linux/popup.ts` | nuevo | -0 | 0 |
| 🆕 | `src/helpers/linux/sound.ts` | nuevo | -0 | 0 |
| 🆕 | `src/infrastructure/adapter/NativeTerminalFocusWatcher.ts` | nuevo | -0 | 0 |
| 🆕 | `src/infrastructure/adapter/entity/NodeNotifierDismissOptions.ts` | nuevo | -0 | 0 |
| ✏️ | `test/verify.ts` | +115 | -5 | +110 |
| ✏️ | `README.md` | +36 | -7 | +29 |
| ✏️ | `src/infrastructure/adapter/NativeSoundPlayer.ts` | +28 | -7 | +21 |
| ✏️ | `src/infrastructure/adapter/NodeNotifierSender.ts` | +31 | -3 | +28 |
| ✏️ | `src/infrastructure/adapter/NativePersistentPopup.ts` | +17 | -10 | +7 |
| ✏️ | `notify.example.json` | +11 | -5 | +6 |
| ✏️ | `src/helpers/win32/terminal.ts` | +15 | -1 | +14 |
| ✏️ | `src/infrastructure/adapter/mapper/NodeNotifierMapper.ts` | +10 | -5 | +5 |
| ✏️ | `src/infrastructure/config/defaultNotifyConfig.ts` | +10 | -4 | +6 |
| ✏️ | `src/domain/entity/PopupConfig.ts` | +5 | -7 | -2 |
| ✏️ | `src/infrastructure/controller/EventController.ts` | +11 | -0 | +11 |
| ✏️ | `src/infrastructure/adapter/NativeTerminalFocuser.ts` | +6 | -2 | +4 |
| ✏️ | `opencode-notificaciones.md` | +3 | -3 | 0 |
| ✏️ | `src/infrastructure/adapter/mapper/NotifyConfigMapper.ts` | +5 | -1 | +4 |
| ✏️ | `package-lock.json` | +2 | -2 | 0 |
| ✏️ | `src/infrastructure/plugin.ts` | +3 | -1 | +2 |
| ✏️ | `package.json` | +2 | -1 | +1 |
| ✏️ | `src/domain/entity/NotificationMessage.ts` | +3 | -0 | +3 |
| ✏️ | `src/infrastructure/adapter/AnsiTitleFlasher.ts` | +1 | -1 | 0 |
| ✏️ | `src/infrastructure/adapter/BunLogger.ts` | +1 | -1 | 0 |
| ✏️ | `src/infrastructure/adapter/entity/NodeNotifierOptions.ts` | +2 | -0 | +2 |
| ✏️ | `src/application/usecase/NotifyOnEventUseCase.ts` | +1 | -0 | +1 |

### 📁 Lista completa

<details>
<summary>Ver todos los archivos (30)</summary>

**🆕 Nuevos:**
```
CHANGELOG.md
monitor.cjs
src/domain/entity/PopupStyle.ts
src/domain/port/out/TerminalFocusWatcher.ts
src/helpers/linux/popup.ts
src/helpers/linux/sound.ts
src/infrastructure/adapter/NativeTerminalFocusWatcher.ts
src/infrastructure/adapter/entity/NodeNotifierDismissOptions.ts
```

**✏️ Modificados:**
```
test/verify.ts
README.md
src/infrastructure/adapter/NativeSoundPlayer.ts
src/infrastructure/adapter/NodeNotifierSender.ts
src/infrastructure/adapter/NativePersistentPopup.ts
notify.example.json
src/helpers/win32/terminal.ts
src/infrastructure/adapter/mapper/NodeNotifierMapper.ts
src/infrastructure/config/defaultNotifyConfig.ts
src/domain/entity/PopupConfig.ts
src/infrastructure/controller/EventController.ts
src/infrastructure/adapter/NativeTerminalFocuser.ts
opencode-notificaciones.md
src/infrastructure/adapter/mapper/NotifyConfigMapper.ts
package-lock.json
src/infrastructure/plugin.ts
package.json
src/domain/entity/NotificationMessage.ts
src/infrastructure/adapter/AnsiTitleFlasher.ts
src/infrastructure/adapter/BunLogger.ts
src/infrastructure/adapter/entity/NodeNotifierOptions.ts
src/application/usecase/NotifyOnEventUseCase.ts
```

</details>

### 💻 Código Añadido

**README.md** (+36 líneas)**

```
Sin configuración adicional se activan `system`, `sound` y `popup` para todos
los eventos; `titleFlash` queda desactivado.
  "sound": true,
- `system`: toast nativo mediante el fork mantenido `toasted-notifier`. En
  Windows permanece hasta volver a la terminal; en macOS/Linux es transitorio.
    "opacity": 1,
    "events": {
      "complete": { "blinkColors": ["#14532D", "#22C55E"], "textColor": "#FFFFFF" },
      "error": { "blinkColors": ["#7F1D1D", "#EF4444"], "textColor": "#FFFFFF" },
      "permission": { "blinkColors": ["#78350F", "#F59E0B"], "textColor": "#111827" },
      "question": { "blinkColors": ["#312E81", "#6366F1"], "textColor": "#FFFFFF" }
    }
Los campos globales son el fallback. Cada entrada de `events` reemplaza solo los
campos declarados. Un color produce fondo estático; dos o más producen parpadeo.

En Windows el popup usa un formulario WinForms no activable. En Linux intenta
Tkinter para conservar colores, fuente, opacidad y parpadeo; si no está
disponible cae a Zenity y luego a `notify-send`. En macOS usa `osascript`.

Dependencias recomendadas en Linux:

```sh
# Debian/Ubuntu
sudo apt install python3-tk libcanberra-gtk3-module

# Fedora
sudo dnf install python3-tkinter libcanberra-gtk3

# Arch
sudo pacman -S tk libcanberra
```

Los colores del toast del sistema dependen del tema del sistema operativo y no
son controlables por el plugin. La personalización visual completa pertenece al
popup.
    ├── linux/
```

**notify.example.json** (+11 líneas)**

```
    "permission": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "complete": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "error": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "question": { "system": true, "sound": true, "popup": true, "titleFlash": false }
    "opacity": 1,
    "events": {
      "complete": { "blinkColors": ["#14532D", "#22C55E"], "textColor": "#FFFFFF" },
      "error": { "blinkColors": ["#7F1D1D", "#EF4444"], "textColor": "#FFFFFF" },
      "permission": { "blinkColors": ["#78350F", "#F59E0B"], "textColor": "#111827" },
      "question": { "blinkColors": ["#312E81", "#6366F1"], "textColor": "#FFFFFF" }
    }
```

**opencode-notificaciones.md** (+3 líneas)**

```
- **Linux** → toast nativo + popup Tkinter (fallback Zenity/`notify-send`) + audio con detección de backend
| `SoundPlayer`          | `NativeSoundPlayer`           | Strategy por SO y detección de backend Linux |
  - macOS → `terminal-notifier`; Linux → `notify-send` para el toast y Tkinter para el popup.
```

**package-lock.json** (+2 líneas)**

```
  "version": "0.2.0",
      "version": "0.2.0",
```

**package.json** (+2 líneas)**

```
  "version": "0.2.0",
    "CHANGELOG.md",
```

**src/application/usecase/NotifyOnEventUseCase.ts** (+1 línea)**

```
      kind: event.type,
```

**src/domain/entity/NotificationMessage.ts** (+3 líneas)**

```
import type { EventType } from "../enum/EventType.js";

  kind: EventType;
```

**src/domain/entity/PopupConfig.ts** (+5 líneas)**

```
import type { PopupStyle } from "./PopupStyle.js";
import type { EventType } from "../enum/EventType.js";

export type PopupConfig = PopupStyle & {
  events: Partial<Record<EventType, Partial<PopupStyle>>>;
```

**src/helpers/win32/terminal.ts** (+15 líneas)**

```
  '  $diag = Join-Path $env:TEMP "opencode-desktop-notify-popup.log"',

export const WAIT_FOR_TERMINAL_FOCUS_PS = [
  "if ($script:target -eq [IntPtr]::Zero) { exit 2 }",
  "$wasAway = ([Focuser]::GetForegroundWindow() -ne $script:target)",
  "while ($true) {",
  "  $foreground = [Focuser]::GetForegroundWindow()",
  "  if (-not $wasAway) {",
  "    if ($foreground -ne $script:target) { $wasAway = $true }",
  "  } elseif ($foreground -eq $script:target) {",
  "    exit 0",
  "  }",
  "  Start-Sleep -Milliseconds 150",
  "}",
].join("\n");
```

**src/infrastructure/adapter/AnsiTitleFlasher.ts** (+1 línea)**

```
      exec(`powershell -NoProfile -NonInteractive -Command "[console]::Title"`, { windowsHide: true }, (error, stdout) => {
```

**src/infrastructure/adapter/BunLogger.ts** (+1 línea)**

```
    this.client.app.log({ body: { service: "opencode-desktop-notify", level, message } }).catch(() => {});
```

**src/infrastructure/adapter/NativePersistentPopup.ts** (+17 líneas)**

```
import type { PopupStyle } from "../../domain/entity/PopupStyle.js";
import { LINUX_POPUP_PY, LINUX_POPUP_SH } from "../../helpers/linux/popup.js";
    const child = spawn(command[0], command.slice(1), {
      stdio: "ignore",
      detached: this.platform !== "win32",
      windowsHide: this.platform === "win32",
      env,
    });
      POPUP_STYLE: JSON.stringify(await this.style(message)),
      POPUP_LINUX_SCRIPT: LINUX_POPUP_PY,
  private async style(message: NotificationMessage): Promise<PopupStyle> {
    const popup = this.config ? (await this.config.get()).popup : DEFAULT_POPUP_CONFIG;
    const { events, ...globalStyle } = popup;
    return { ...globalStyle, ...events[message.kind] };
        return ["powershell", "-NoProfile", "-NonInteractive", "-STA", "-Command", this.windowsScript()];
        return ["sh", "-c", LINUX_POPUP_SH];
      '$diag = Join-Path $env:TEMP "opencode-desktop-notify-popup.log"',
```

**src/infrastructure/adapter/NativeSoundPlayer.ts** (+28 líneas)**

```
import { LINUX_DEFAULT_SOUND_SH, LINUX_FILE_SOUND_SH } from "../../helpers/linux/sound.js";
    await new Promise<void>((resolve, reject) => {
      const child = spawn(command[0], command.slice(1), {
        stdio: "ignore",
        detached: true,
        windowsHide: this.platform === "win32",
      });
      child.once("error", reject);
      child.once("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`sound player exited with code ${String(code)}`));
      });
        return ["powershell", "-NoProfile", "-NonInteractive", "-Command", "[console]::beep(1000, 300)"];
        return ["sh", "-c", LINUX_DEFAULT_SOUND_SH, "opencode-sound", this.linuxSoundName(sound)];
      return ["powershell", "-NoProfile", "-NonInteractive", "-Command", `(New-Object Media.SoundPlayer '${path}').PlaySync()`];
    if (this.platform === "linux") return ["sh", "-c", LINUX_FILE_SOUND_SH, "opencode-sound", path];

  private linuxSoundName(sound: SoundRequest): string {
    switch (sound.kind) {
      case "error":
        return "dialog-error";
      case "question":
      case "permission":
        return "dialog-question";
      default:
        return "complete";
    }
  }
```

**src/infrastructure/adapter/NativeTerminalFocuser.ts** (+6 líneas)**

```
      const child = spawn(command[0], command.slice(1), {
        stdio: "ignore",
        detached: this.platform !== "win32",
        windowsHide: this.platform === "win32",
      });
        return ["powershell", "-NoProfile", "-NonInteractive", "-Command", this.windowsScript()];
```

**src/infrastructure/adapter/NodeNotifierSender.ts** (+31 líneas)**

```
import type { TerminalFocusWatcher } from "../../domain/port/out/TerminalFocusWatcher.js";
import type { NodeNotifierDismissOptions } from "./entity/NodeNotifierDismissOptions.js";
  private activeId: number | undefined;
  private nextId = (process.pid * 1000) % 2_000_000_000;
  constructor(
    private readonly config: NotifierConfig,
    private readonly focusWatcher: TerminalFocusWatcher,
    onActivate?: () => void,
    private readonly platform: NodeJS.Platform = process.platform,
  ) {
    await this.dismiss();
    const id = this.platform === "win32" ? this.nextId++ : undefined;
    this.activeId = id;
    if (id !== undefined) this.focusWatcher.start(() => void this.dismiss(id));
    try {
      await this.notify(NodeNotifierMapper.toInfrastructure(message, settings, this.platform, id));
    } finally {
      if (id !== undefined && this.activeId === id) {
        this.activeId = undefined;
        this.focusWatcher.stop();
      }
    }
  }

  async dismiss(expectedId?: number): Promise<void> {
    const id = this.activeId;
    if (id === undefined || (expectedId !== undefined && expectedId !== id)) return;
    this.activeId = undefined;
    this.focusWatcher.stop();
    await this.notify({ close: id });
  private notify(options: NodeNotifierOptions | NodeNotifierDismissOptions): Promise<void> {
```

**src/infrastructure/adapter/entity/NodeNotifierOptions.ts** (+2 líneas)**

```
  id?: number;
  silent?: boolean;
```

**src/infrastructure/adapter/mapper/NodeNotifierMapper.ts** (+10 líneas)**

```
  static toInfrastructure(
    message: NotificationMessage,
    settings: NotifyConfig,
    platform: NodeJS.Platform,
    id?: number,
  ): NodeNotifierOptions {
    const options: NodeNotifierOptions = {
      silent: true,
    if (platform === "win32") return { ...options, id, wait: true };
    return { ...options, appName: settings.toast.appName, timeout: 5, wait: false };
```

**src/infrastructure/adapter/mapper/NotifyConfigMapper.ts** (+5 líneas)**

```
      popup: {
        ...DEFAULT_NOTIFY_CONFIG.popup,
        ...source.popup,
        events: { ...DEFAULT_NOTIFY_CONFIG.popup.events, ...source.popup?.events },
      },
```

**src/infrastructure/config/defaultNotifyConfig.ts** (+10 líneas)**

```
  events: {
    [EventType.Complete]: { blinkColors: ["#14532D", "#22C55E"], textColor: "#FFFFFF" },
    [EventType.Error]: { blinkColors: ["#7F1D1D", "#EF4444"], textColor: "#FFFFFF" },
    [EventType.Permission]: { blinkColors: ["#78350F", "#F59E0B"], textColor: "#111827" },
    [EventType.Question]: { blinkColors: ["#312E81", "#6366F1"], textColor: "#FFFFFF" },
  },
    [EventType.Complete]: { system: true, sound: true, popup: true, titleFlash: false },
    [EventType.Error]: { system: true, sound: true, popup: true, titleFlash: false },
    [EventType.Permission]: { system: true, sound: true, popup: true, titleFlash: false },
    [EventType.Question]: { system: true, sound: true, popup: true, titleFlash: false },
```

**src/infrastructure/controller/EventController.ts** (+11 líneas)**

```
  private readonly failedSessions = new Set<string>();

    if (event.type === "session.status" && event.properties.status.type === "busy") {
      this.failedSessions.delete(event.properties.sessionID);
      return;
    }
    if (event.type === "session.error" && event.properties.sessionID) {
      this.failedSessions.add(event.properties.sessionID);
    }
    if (event.type === "session.idle" && this.failedSessions.delete(event.properties.sessionID)) return;

```

**src/infrastructure/plugin.ts** (+3 líneas)**

```
import { NativeTerminalFocusWatcher } from "./adapter/NativeTerminalFocusWatcher.js";
  const focusWatcher = new NativeTerminalFocusWatcher();
  const sender = new NodeNotifierSender(config, focusWatcher, () => {
```

**test/verify.ts** (+115 líneas)**

```
import { LINUX_POPUP_PY, LINUX_POPUP_SH } from "../src/helpers/linux/popup.js";
import { LINUX_DEFAULT_SOUND_SH, LINUX_FILE_SOUND_SH } from "../src/helpers/linux/sound.js";
import { FOCUS_TERMINAL_PS, NOACTIVATE_FORM_CS, WAIT_FOR_TERMINAL_FOCUS_PS } from "../src/helpers/win32/terminal.js";
import { NativeSoundPlayer } from "../src/infrastructure/adapter/NativeSoundPlayer.js";
import { NativeTerminalFocuser } from "../src/infrastructure/adapter/NativeTerminalFocuser.js";
import { NativeTerminalFocusWatcher } from "../src/infrastructure/adapter/NativeTerminalFocusWatcher.js";
import { NodeNotifierMapper } from "../src/infrastructure/adapter/mapper/NodeNotifierMapper.js";
import { DEFAULT_NOTIFY_CONFIG } from "../src/infrastructure/config/defaultNotifyConfig.js";
const verifyDir = await mkdtemp(join(tmpdir(), "opencode-desktop-notify-verify-"));
    popup: {
      blinkColors: ["#101820"],
      textColor: "#FFFFFF",
      fontSize: 13,
      events: {
        error: { blinkColors: ["#7F1D1D", "#EF4444"] },
      },
    },
check(popup.shown[0]?.kind === EventType.Permission, "mensaje conserva el tipo de evento");
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

const windowsPopup = new NativePersistentPopup(undefined, "win32") as unknown as {
  command(message: NotificationMessage): string[];
  windowsScript(): string;
};
const popupScript = windowsPopup.windowsScript();
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
```

---
