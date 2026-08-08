# 📊 Registro de Cambios con Estadísticas
**Iniciado:** 7/8/2026, 10:25:57 p. m.
**Proyecto:** C:\Users\Usuario\Documents\notificaciones-opencode
**Formato:** Archivos nuevos, modificados y eliminados
**Estado:** Monitoreando cambios no commiteados


## 🕐 07/08/2026, 22:25:59

### 📊 Resumen
- **Total archivos:** 16
- **📝 Nuevos:** 1
- **✏️ Modificados:** 15
- **🗑️ Eliminados:** 0
- **Líneas añadidas:** +394
- **Líneas eliminadas:** -28
- **Balance neto:** +366 líneas

### 📝 Detalle por archivo

| Estado | Archivo | Añadidas | Eliminadas | Neto |
|--------|---------|----------|------------|------|
| 🆕 | `src/domain/entity/PopupImage.ts` | nuevo | -0 | 0 |
| ✏️ | `src/infrastructure/adapter/NativePersistentPopup.ts` | +107 | -7 | +100 |
| ✏️ | `test/verify.ts` | +96 | -2 | +94 |
| ✏️ | `README.md` | +58 | -3 | +55 |
| ✏️ | `src/helpers/linux/popup.ts` | +46 | -5 | +41 |
| ✏️ | `src/infrastructure/adapter/JsonConfigLoader.ts` | +25 | -2 | +23 |
| ✏️ | `src/infrastructure/adapter/entity/NotifyConfigFile.ts` | +22 | -2 | +20 |
| ✏️ | `src/infrastructure/adapter/mapper/NotifyConfigMapper.ts` | +18 | -1 | +17 |
| ✏️ | `CHANGELOG.md` | +7 | -0 | +7 |
| ✏️ | `src/domain/entity/PopupStyle.ts` | +7 | -0 | +7 |
| ✏️ | `package-lock.json` | +2 | -2 | 0 |
| ✏️ | `src/domain/entity/PopupConfig.ts` | +2 | -2 | 0 |
| ✏️ | `package.json` | +1 | -1 | 0 |
| ✏️ | `src/infrastructure/plugin.ts` | +1 | -1 | 0 |
| ✏️ | `notify.example.json` | +1 | -0 | +1 |
| ✏️ | `src/infrastructure/config/defaultNotifyConfig.ts` | +1 | -0 | +1 |

### 📁 Lista completa

<details>
<summary>Ver todos los archivos (16)</summary>

**🆕 Nuevos:**
```
src/domain/entity/PopupImage.ts
```

**✏️ Modificados:**
```
src/infrastructure/adapter/NativePersistentPopup.ts
test/verify.ts
README.md
src/helpers/linux/popup.ts
src/infrastructure/adapter/JsonConfigLoader.ts
src/infrastructure/adapter/entity/NotifyConfigFile.ts
src/infrastructure/adapter/mapper/NotifyConfigMapper.ts
CHANGELOG.md
src/domain/entity/PopupStyle.ts
package-lock.json
src/domain/entity/PopupConfig.ts
package.json
src/infrastructure/plugin.ts
notify.example.json
src/infrastructure/config/defaultNotifyConfig.ts
```

</details>

### 💻 Código Añadido

**CHANGELOG.md** (+7 líneas)**

```
## 0.3.0

- Add optional local 64x64 PNG images to Windows and Linux popups.
- Support one global popup image or per-event image overrides.
- Resolve relative image paths from the directory containing `notify.json`.
- Support left and right image placement with safe text-only fallback.

```

**README.md** (+58 líneas)**

```
    "opencode-desktop-notify@0.3.0"
Reinicia OpenCode después del cambio. En una versión futura, reemplaza `0.3.0`
    "image": { "enabled": false, "position": "left" },
#### Imagen PNG

El popup admite una imagen PNG global para todos los eventos:

```json
{
  "popup": {
    "image": {
      "enabled": true,
      "path": "./images/opencode.png",
      "position": "left"
    }
  }
}
```

Cada evento puede reemplazar la ruta o posición global, o desactivar la imagen:

```json
{
  "popup": {
    "image": {
      "enabled": true,
      "path": "./images/default.png",
      "position": "left"
    },
    "events": {
      "complete": {
        "image": { "path": "./images/complete.png" }
      },
      "error": {
        "image": { "path": "C:/Images/error.png", "position": "right" }
      },
      "permission": {
        "image": { "enabled": false }
      }
    }
  }
}
```

- Solo se admiten archivos PNG locales de exactamente `64x64` píxeles y hasta 2 MB.
- `position` acepta `left` o `right`; cualquier otro valor usa `left`.
- Las rutas relativas se resuelven desde la carpeta que contiene `notify.json`.
- Una imagen específica hereda los campos omitidos de la imagen global.
- Si el archivo falta o no es válido, el popup continúa funcionando solo con texto.
- En Linux, la imagen completa requiere Tkinter; los fallbacks la usan como icono.

La propiedad `messages.<evento>.icon` continúa siendo independiente y pertenece
al toast del sistema.

#### Campos disponibles

| `image` | objeto | PNG opcional global de `64x64`, con posición izquierda o derecha |
| Popup | WinForms, PNG y estilos | Tkinter con PNG y fallbacks básicos | Alerta de AppleScript |
```

**notify.example.json** (+1 línea)**

```
    "image": { "enabled": false, "position": "left" },
```

**package-lock.json** (+2 líneas)**

```
  "version": "0.3.0",
      "version": "0.3.0",
```

**package.json** (+1 línea)**

```
  "version": "0.3.0",
```

**src/domain/entity/PopupConfig.ts** (+2 líneas)**

```
import type { PopupStyle, PopupStyleOverride } from "./PopupStyle.js";
  events: Partial<Record<EventType, PopupStyleOverride>>;
```

**src/domain/entity/PopupStyle.ts** (+7 líneas)**

```
import type { PopupImage } from "./PopupImage.js";

  image: PopupImage;
};

export type PopupStyleOverride = Partial<Omit<PopupStyle, "image">> & {
  image?: Partial<PopupImage>;
```

**src/helpers/linux/popup.ts** (+46 líneas)**

```
  "image = style.get('image') or {}",
  "image_enabled = bool(image.get('enabled'))",
  "image_path = image.get('path') or ''",
  "image_position = 'right' if image.get('position') == 'right' else 'left'",
  "root.configure(bg=colors[0])",
  "container = tk.Frame(root, bg=colors[0], borderwidth=0, highlightthickness=0)",
  "container.pack()",
  "label = tk.Label(container, text=title + '\\n\\n' + message, bg=colors[0], fg=foreground, font=(font_family, font_size), borderwidth=0, highlightthickness=0, justify='left')",
  "image_photo = None",
  "image_label = None",
  "if image_enabled and image_path:",
  "    try:",
  "        image_photo = tk.PhotoImage(file=image_path)",
  "        if image_photo.width() != 64 or image_photo.height() != 64:",
  "            raise ValueError('PNG must be 64x64')",
  "    except (tk.TclError, ValueError):",
  "        image_photo = None",
  "if image_photo is not None:",
  "    image_label = tk.Label(container, image=image_photo, bg=colors[0], borderwidth=0, highlightthickness=0)",
  "    if image_position == 'right':",
  "        label.pack(side='left', padx=(20, 12), pady=20)",
  "        image_label.pack(side='left', padx=(0, 20), pady=20)",
  "    else:",
  "        image_label.pack(side='left', padx=(20, 0), pady=20)",
  "        label.pack(side='left', padx=(12, 20), pady=20)",
  "else:",
  "    label.pack(padx=20, pady=20)",
  "def close_popup(_event=None):",
  "    root.destroy()",
  "root.bind('<Button-1>', close_popup)",
  "container.bind('<Button-1>', close_popup)",
  "label.bind('<Button-1>', close_popup)",
  "if image_label is not None:",
  "    image_label.bind('<Button-1>', close_popup)",
  "        color = colors[color_index]",
  "        root.configure(bg=color)",
  "        container.configure(bg=color)",
  "        label.configure(bg=color)",
  "        if image_label is not None:",
  "            image_label.configure(bg=color)",
  "  if [ -n \"$POPUP_IMAGE_PATH\" ]; then",
  "    exec zenity --info --title=\"$POPUP_TITLE\" --text=\"$POPUP_MESSAGE\" --no-wrap --window-icon=\"$POPUP_IMAGE_PATH\"",
  "  fi",
  "  if [ -n \"$POPUP_IMAGE_PATH\" ]; then",
  "    exec notify-send -u critical -t 0 -i \"$POPUP_IMAGE_PATH\" \"$POPUP_TITLE\" \"$POPUP_MESSAGE\"",
  "  fi",
```

**src/infrastructure/adapter/JsonConfigLoader.ts** (+25 líneas)**

```
import { dirname, isAbsolute, join, resolve } from "node:path";
import type { PopupConfig } from "../../domain/entity/PopupConfig.js";
import { EventType } from "../../domain/enum/EventType.js";
      return this.resolveImagePaths(NotifyConfigMapper.toDomain(source));

  private resolveImagePaths(config: NotifyConfig): NotifyConfig {
    const events = { ...config.popup.events };
    for (const type of Object.values(EventType)) {
      const style = events[type];
      if (style?.image) events[type] = { ...style, image: this.resolveImagePath(style.image) };
    }
    return {
      ...config,
      popup: {
        ...config.popup,
        image: this.resolveImagePath(config.popup.image),
        events: events as PopupConfig["events"],
      },
    };
  }

  private resolveImagePath<T extends { path?: string }>(image: T): T {
    if (!image.path || isAbsolute(image.path)) return image;
    return { ...image, path: resolve(dirname(resolve(this.path)), image.path) };
  }
```

**src/infrastructure/adapter/NativePersistentPopup.ts** (+107 líneas)**

```
import { open, stat } from "node:fs/promises";
import { extname } from "node:path";
import type { Logger } from "../../domain/port/out/Logger.js";
  private static readonly MAX_PNG_BYTES = 2 * 1024 * 1024;
    private readonly logger?: Logger,
    const style = await this.style(message);
      POPUP_STYLE: JSON.stringify(style),
      POPUP_IMAGE_PATH: style.image.enabled ? style.image.path : "",
    const override = events[message.kind];
    const image = { ...globalStyle.image, ...override?.image };
    return this.validateImage({
      ...globalStyle,
      ...override,
      image: { ...image, position: image.position === "right" ? "right" : "left" },
    });
  }

  private async validateImage(style: PopupStyle): Promise<PopupStyle> {
    const path = style.image.path;
    if (!style.image.enabled) return style;
    if (!path) return this.disableImage(style, "missing path");
    if (extname(path).toLowerCase() !== ".png") return this.disableImage(style, "only PNG files are supported");

    try {
      const fileStat = await stat(path);
      if (!fileStat.isFile()) return this.disableImage(style, "path is not a file");
      if (fileStat.size > NativePersistentPopup.MAX_PNG_BYTES) {
        return this.disableImage(style, "file exceeds 2 MB");
      }

      const handle = await open(path, "r");
      try {
        const header = Buffer.alloc(24);
        const { bytesRead } = await handle.read(header, 0, header.length, 0);
        const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        const validHeader =
          bytesRead === header.length &&
          header.subarray(0, signature.length).equals(signature) &&
          header.toString("ascii", 12, 16) === "IHDR";
        if (!validHeader) return this.disableImage(style, "invalid PNG header");
        const width = header.readUInt32BE(16);
        const height = header.readUInt32BE(20);
        if (width !== 64 || height !== 64) return this.disableImage(style, `expected 64x64, received ${width}x${height}`);
      } finally {
        await handle.close();
      }
    } catch (error) {
      return this.disableImage(style, error instanceof Error ? error.message : String(error));
    }
    return style;
  }

  private disableImage(style: PopupStyle, reason: string): PopupStyle {
    this.logger?.warn(`popup image ignored (${reason}): ${style.image.path ?? "<empty>"}`);
    return { ...style, image: { ...style.image, enabled: false } };
      'if (-not $styleJson) { $styleJson = \'{"blinkColors":["#FFC800","#FF5050"],"blinkIntervalMs":600,"fontFamily":"Segoe UI","fontSize":12,"textColor":"#111111","opacity":1,"image":{"enabled":false,"position":"left"}}\' }',
      "$label.BackColor = [System.Drawing.Color]::Transparent",
      "$picture = $null",
      "$content = $null",
      "$imageLoaded = $false",
      "if ($style.image.enabled -and $style.image.path -and (Test-Path -LiteralPath $style.image.path -PathType Leaf)) {",
      "  try {",
      "    $picture = New-Object System.Windows.Forms.PictureBox",
      "    $picture.Width = 64",
      "    $picture.Height = 64",
      '    $picture.SizeMode = "Zoom"',
      "    $picture.BackColor = [System.Drawing.Color]::Transparent",
      "    $sourceImage = [System.Drawing.Image]::FromFile([string]$style.image.path)",
      "    try { $picture.Image = [System.Drawing.Bitmap]::new($sourceImage) } finally { $sourceImage.Dispose() }",
      "    $content = New-Object System.Windows.Forms.FlowLayoutPanel",
      "    $content.AutoSize = $true",
      '    $content.AutoSizeMode = "GrowAndShrink"',
      '    $content.FlowDirection = "LeftToRight"',
      "    $content.WrapContents = $false",
      "    $content.Margin = [System.Windows.Forms.Padding]::new(0)",
      "    $content.Padding = [System.Windows.Forms.Padding]::new(0)",
      "    $content.BackColor = [System.Drawing.Color]::Transparent",
      '    if ($style.image.position -eq "right") {',
      "      $label.Padding = [System.Windows.Forms.Padding]::new(20, 20, 12, 20)",
      "      $picture.Margin = [System.Windows.Forms.Padding]::new(0, 20, 20, 20)",
      "      $content.Controls.Add($label) | Out-Null",
      "      $content.Controls.Add($picture) | Out-Null",
      "    } else {",
      "      $picture.Margin = [System.Windows.Forms.Padding]::new(20, 20, 0, 20)",
      "      $label.Padding = [System.Windows.Forms.Padding]::new(12, 20, 20, 20)",
      "      $content.Controls.Add($picture) | Out-Null",
      "      $content.Controls.Add($label) | Out-Null",
      "    }",
      "    $form.Controls.Add($content)",
      "    $imageLoaded = $true",
      "  } catch {",
      "    if ($picture -and $picture.Image) { $picture.Image.Dispose() }",
      "    $picture = $null",
      "    $content = $null",
      "  }",
      "}",
      "if (-not $imageLoaded) {",
      "  $label.Padding = [System.Windows.Forms.Padding]::new(20)",
      "  $form.Controls.Add($label)",
      "}",
      "  $form.BackColor = $colors[0]",
      "$activatePopup = { $script:activated = $true; Add-Content -Path $diag -Value \"click fg=$([Focuser]::GetForegroundWindow()) target=$script:target\"; Focus-Terminal; $form.Close() }",
      "$form.Add_Click($activatePopup)",
      "$label.Add_Click($activatePopup)",
      "if ($content) { $content.Add_Click($activatePopup) }",
      "if ($picture) { $picture.Add_Click($activatePopup) }",
      "$form.Add_FormClosed({ if ($picture -and $picture.Image) { $picture.Image.Dispose() } })",
```

**src/infrastructure/adapter/entity/NotifyConfigFile.ts** (+22 líneas)**

```
import type { ChannelConfig } from "../../../domain/entity/ChannelConfig.js";
import type { NotificationTemplate } from "../../../domain/entity/NotificationTemplate.js";
import type { PopupStyleOverride } from "../../../domain/entity/PopupStyle.js";
import type { QuietHoursConfig } from "../../../domain/entity/QuietHoursConfig.js";
import type { TitleFlashConfig } from "../../../domain/entity/TitleFlashConfig.js";
import type { ToastConfig } from "../../../domain/entity/ToastConfig.js";
import type { EventType } from "../../../domain/enum/EventType.js";
type PopupConfigFile = PopupStyleOverride & {
  events?: Partial<Record<EventType, PopupStyleOverride>>;
};

export type NotifyConfigFile = {
  events?: Partial<Record<EventType, Partial<ChannelConfig>>>;
  messages?: Partial<Record<EventType, Partial<NotificationTemplate>>>;
  sounds?: Partial<Record<EventType, string>>;
  cooldownMs?: number;
  quietHours?: Partial<QuietHoursConfig>;
  onlyMainSessions?: boolean;
  toast?: Partial<ToastConfig>;
  titleFlash?: Partial<TitleFlashConfig>;
  popup?: PopupConfigFile;
};
```

**src/infrastructure/adapter/mapper/NotifyConfigMapper.ts** (+18 líneas)**

```
    const popupEvent = (type: EventType) => {
      const defaults = DEFAULT_NOTIFY_CONFIG.popup.events[type];
      const override = source.popup?.events?.[type];
      if (!defaults) return override;
      if (!override) return defaults;
      return {
        ...defaults,
        ...override,
        image: defaults.image || override.image ? { ...defaults.image, ...override.image } : undefined,
      };
    };
        image: { ...DEFAULT_NOTIFY_CONFIG.popup.image, ...source.popup?.image },
        events: {
          [EventType.Complete]: popupEvent(EventType.Complete),
          [EventType.Error]: popupEvent(EventType.Error),
          [EventType.Permission]: popupEvent(EventType.Permission),
          [EventType.Question]: popupEvent(EventType.Question),
        },
```

**src/infrastructure/config/defaultNotifyConfig.ts** (+1 línea)**

```
  image: { enabled: false, position: "left" },
```

**src/infrastructure/plugin.ts** (+1 línea)**

```
  }, logger);
```

**test/verify.ts** (+96 líneas)**

```
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
      image: { enabled: true, path: "./global.png", position: "right" },
        error: { blinkColors: ["#7F1D1D", "#EF4444"], image: { path: "./error.png", position: "left" } },
        permission: { image: { enabled: false } },
check(loadedConfig.popup.image.path === globalImagePath, "ruta PNG global se resuelve desde notify.json");
check(loadedConfig.popup.events.error?.image?.path === errorImagePath, "ruta PNG por evento se resuelve desde notify.json");
  env(message: NotificationMessage): Promise<NodeJS.ProcessEnv>;
  style(message: NotificationMessage): Promise<{
    blinkColors: string[];
    textColor: string;
    fontSize: number;
    image: { enabled: boolean; path?: string; position: string };
  }>;
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
check(!defaults.popup.image.enabled && defaults.popup.image.position === "left", "imagen popup viene desactivada por defecto");
check(
  LINUX_POPUP_PY.includes("tk.PhotoImage") && LINUX_POPUP_PY.includes("image_position") && LINUX_POPUP_PY.includes("64"),
  "popup Tkinter carga PNG 64x64 a izquierda o derecha",
);
check(
  LINUX_POPUP_SH.includes("--window-icon") && LINUX_POPUP_SH.includes("notify-send -u critical -t 0 -i"),
  "fallbacks Linux reciben el PNG como icono",
);
check(
  popupScript.includes("System.Windows.Forms.PictureBox") &&
    popupScript.includes("System.Drawing.Image]::FromFile") &&
    popupScript.includes("$picture.Add_Click"),
  "popup Windows muestra PNG y conserva activación por clic",
);
check(popupScript.includes("$picture.Image.Dispose()"), "popup Windows libera la imagen al cerrar");
```

---

## 🕐 07/08/2026, 22:33:26

### 📊 Resumen
- **Total archivos:** 16
- **📝 Nuevos:** 1
- **✏️ Modificados:** 15
- **🗑️ Eliminados:** 0
- **Líneas añadidas:** +788
- **Líneas eliminadas:** -28
- **Balance neto:** +760 líneas

### 📝 Detalle por archivo

| Estado | Archivo | Añadidas | Eliminadas | Neto |
|--------|---------|----------|------------|------|
| 🆕 | `src/domain/entity/PopupImage.ts` | nuevo | -0 | 0 |
| ✏️ | `README.md` | +452 | -3 | +449 |
| ✏️ | `src/infrastructure/adapter/NativePersistentPopup.ts` | +107 | -7 | +100 |
| ✏️ | `test/verify.ts` | +96 | -2 | +94 |
| ✏️ | `src/helpers/linux/popup.ts` | +46 | -5 | +41 |
| ✏️ | `src/infrastructure/adapter/JsonConfigLoader.ts` | +25 | -2 | +23 |
| ✏️ | `src/infrastructure/adapter/entity/NotifyConfigFile.ts` | +22 | -2 | +20 |
| ✏️ | `src/infrastructure/adapter/mapper/NotifyConfigMapper.ts` | +18 | -1 | +17 |
| ✏️ | `CHANGELOG.md` | +7 | -0 | +7 |
| ✏️ | `src/domain/entity/PopupStyle.ts` | +7 | -0 | +7 |
| ✏️ | `package-lock.json` | +2 | -2 | 0 |
| ✏️ | `src/domain/entity/PopupConfig.ts` | +2 | -2 | 0 |
| ✏️ | `package.json` | +1 | -1 | 0 |
| ✏️ | `src/infrastructure/plugin.ts` | +1 | -1 | 0 |
| ✏️ | `notify.example.json` | +1 | -0 | +1 |
| ✏️ | `src/infrastructure/config/defaultNotifyConfig.ts` | +1 | -0 | +1 |

### 📁 Lista completa

<details>
<summary>Ver todos los archivos (16)</summary>

**🆕 Nuevos:**
```
src/domain/entity/PopupImage.ts
```

**✏️ Modificados:**
```
README.md
src/infrastructure/adapter/NativePersistentPopup.ts
test/verify.ts
src/helpers/linux/popup.ts
src/infrastructure/adapter/JsonConfigLoader.ts
src/infrastructure/adapter/entity/NotifyConfigFile.ts
src/infrastructure/adapter/mapper/NotifyConfigMapper.ts
CHANGELOG.md
src/domain/entity/PopupStyle.ts
package-lock.json
src/domain/entity/PopupConfig.ts
package.json
src/infrastructure/plugin.ts
notify.example.json
src/infrastructure/config/defaultNotifyConfig.ts
```

</details>

### 💻 Código Añadido

**CHANGELOG.md** (+7 líneas)**

```
## 0.3.0

- Add optional local 64x64 PNG images to Windows and Linux popups.
- Support one global popup image or per-event image overrides.
- Resolve relative image paths from the directory containing `notify.json`.
- Support left and right image placement with safe text-only fallback.

```

**README.md** (+452 líneas)**

```
    "opencode-desktop-notify@0.3.0"
Reinicia OpenCode después del cambio. En una versión futura, reemplaza `0.3.0`
## Guías completas por sistema

Estas dos guías parten desde cero y terminan con colores, una imagen PNG y
sonidos propios. No necesitas instalar el paquete con npm: OpenCode se encarga de
descargarlo cuando encuentra su nombre en `opencode.jsonc`.

- [Guía 1: Windows desde cero](#guia-windows)
- [Guía 2: Linux desde cero](#guia-linux)

Antes de comenzar, conviene entender cómo se arma cada aviso:

| Bloque | Qué controla |
| --- | --- |
| `events.<evento>` | Activa o desactiva toast, sonido, popup y título |
| `sounds.<evento>` | Selecciona el archivo de audio de ese evento |
| `popup` | Define fuente, tamaño, opacidad, velocidad e imagen global |
| `popup.events.<evento>` | Reemplaza solo los estilos indicados para ese evento |
| `messages.<evento>` | Cambia el título y texto que verá el usuario |

Los nombres de evento disponibles son `complete`, `error`, `permission` y
`question`. Todos los campos son opcionales y los valores omitidos conservan la
configuración predeterminada.

<a id="guia-windows"></a>

### Guía 1: Windows desde cero

Windows no necesita una biblioteca gráfica adicional. El popup utiliza
WinForms y System.Drawing a través de Windows PowerShell 5.1, componentes que ya
forman parte de Windows 10 y Windows 11.

#### Paso 1. Activa el plugin

Crea o abre `%USERPROFILE%\.config\opencode\opencode.jsonc` y añade:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-desktop-notify"
  ]
}
```

Si ya hay otros proveedores, modelos o plugins, conserva esas propiedades y
añade únicamente la entrada `opencode-desktop-notify` al arreglo existente.

#### Paso 2. Prepara las carpetas

Ejecuta en PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path `
  "$HOME\.config\opencode\assets\images", `
  "$HOME\.config\opencode\assets\sounds"
```

La estructura resultante será similar a esta:

```text
C:\Users\TU_USUARIO\.config\opencode\
├── opencode.jsonc
├── notify.json
└── assets\
    ├── images\
    │   └── popup.png
    └── sounds\
        ├── complete.wav
        ├── error.wav
        └── attention.wav
```

#### Paso 3. Prepara la imagen y los sonidos

La imagen debe cumplir estas reglas:

- Formato PNG local, no URL ni GIF.
- Dimensiones exactas de `64x64` píxeles; el plugin no la redimensiona.
- Tamaño máximo de 2 MB.
- Puede tener transparencia.

Guarda la imagen como
`%USERPROFILE%\.config\opencode\assets\images\popup.png`. Puedes comprobar sus
dimensiones con PowerShell:

```powershell
Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Image]::FromFile("$HOME\.config\opencode\assets\images\popup.png")
"$($image.Width)x$($image.Height)"
$image.Dispose()
```

El resultado debe ser `64x64`.

Para Windows, usa archivos WAV. PCM WAV es la opción más compatible con
`Media.SoundPlayer`. Prueba uno antes de configurar el plugin:

```powershell
(New-Object Media.SoundPlayer "$HOME\.config\opencode\assets\sounds\complete.wav").PlaySync()
```

#### Paso 4. Crea `notify.json`

Crea `%USERPROFILE%\.config\opencode\notify.json` con esta configuración y
reemplaza `TU_USUARIO` en las rutas de sonido:

```json
{
  "events": {
    "complete": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "error": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "permission": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "question": { "system": true, "sound": true, "popup": true, "titleFlash": false }
  },
  "sounds": {
    "complete": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/complete.wav",
    "error": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/error.wav",
    "permission": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/attention.wav",
    "question": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/attention.wav"
  },
  "popup": {
    "blinkColors": ["#0F172A", "#1E293B"],
    "blinkIntervalMs": 600,
    "fontFamily": "Segoe UI",
    "fontSize": 12,
    "textColor": "#FFFFFF",
    "opacity": 1,
    "image": {
      "enabled": true,
      "path": "./assets/images/popup.png",
      "position": "left"
    },
    "events": {
      "complete": { "blinkColors": ["#14532D", "#22C55E"], "textColor": "#FFFFFF" },
      "error": {
        "blinkColors": ["#7F1D1D", "#EF4444"],
        "textColor": "#FFFFFF",
        "image": { "position": "right" }
      },
      "permission": { "blinkColors": ["#78350F", "#F59E0B"], "textColor": "#111827" },
      "question": { "blinkColors": ["#312E81", "#6366F1"], "textColor": "#FFFFFF" }
    }
  }
}
```

Esta configuración produce los siguientes resultados:

| Evento | Apariencia | Sonido |
| --- | --- | --- |
| `complete` | Parpadeo verde, imagen a la izquierda | `complete.wav` |
| `error` | Parpadeo rojo, imagen a la derecha | `error.wav` |
| `permission` | Parpadeo ámbar, imagen a la izquierda | `attention.wav` |
| `question` | Parpadeo índigo, imagen a la izquierda | `attention.wav` |

La ruta de la imagen es relativa a `notify.json`. Las rutas de sonido son
absolutas porque no se expanden variables como `%USERPROFILE%` dentro del JSON.
En Windows puedes usar `/` como en el ejemplo o escapar cada `\` como `\\`.

#### Paso 5. Ajusta los colores

`blinkColors` acepta colores hexadecimales `#RRGGBB`:

```json
{ "blinkColors": ["#2563EB"] }
```

Un color mantiene el fondo estático. Dos o más colores crean el parpadeo y
`blinkIntervalMs` determina los milisegundos entre cada cambio. `textColor`
controla el contraste del texto, mientras que `opacity` acepta valores entre
`0.2` y `1`.

#### Paso 6. Reinicia y prueba

Cierra todas las instancias de OpenCode y vuelve a iniciarlo. Prueba una tarea
corta para obtener `complete`; una solicitud de permiso o una pregunta permiten
comprobar los demás estilos. En Windows, al pulsar cualquier parte del popup,
incluida la imagen, la terminal se restaura y recibe el foco.

<a id="guia-linux"></a>

### Guía 2: Linux desde cero

En Linux, Tkinter es la biblioteca gráfica que permite mostrar el popup completo
con colores, parpadeo, fuente, opacidad e imagen. No es una dependencia npm y el
plugin no puede instalarla automáticamente: se instala desde el gestor de
paquetes de la distribución.

El orden de backends gráficos es:

| Backend | Uso | Personalización disponible |
| --- | --- | --- |
| Tkinter | Primera opción | Colores, parpadeo, fuente, opacidad y PNG a izquierda o derecha |
| Zenity | Primer respaldo | Diálogo persistente e imagen como icono, sin colores propios |
| `notify-send` | Último respaldo | Notificación del escritorio e icono, apariencia controlada por el sistema |

#### Paso 1. Instala las dependencias

Usa el bloque correspondiente a tu distribución. Estos comandos instalan
Tkinter, los dos backends gráficos de respaldo y al menos un reproductor de
audio habitual.

```sh
# Debian / Ubuntu
sudo apt update
sudo apt install python3-tk zenity libnotify-bin gnome-session-canberra pulseaudio-utils
```

```sh
# Fedora
sudo dnf install python3-tkinter zenity libnotify libcanberra-gtk3 pulseaudio-utils
```

```sh
# Arch Linux
sudo pacman -S tk zenity libnotify libcanberra libpulse
```

Si tu equipo usa otro sistema de audio, también sirven `pw-play` de PipeWire,
`aplay` de ALSA o `ffplay` de FFmpeg. No necesitas instalarlos todos: basta con
que al menos uno pueda reproducir el formato elegido.

Verifica los componentes antes de continuar:

```sh
python3 -c "import tkinter; print('Tkinter', tkinter.TkVersion)"
command -v zenity
command -v notify-send
command -v canberra-gtk-play || command -v paplay || command -v pw-play || command -v ffplay || command -v aplay
```

La primera línea debe imprimir la versión de Tk. En las demás líneas basta con
que aparezca la ruta de un backend gráfico de respaldo y de un reproductor de
audio.

#### Paso 2. Activa el plugin

Crea o abre `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-desktop-notify"
  ]
}
```

No ejecutes `npm install` para una instalación normal. OpenCode descargará y
mantendrá el plugin en su propia caché.

#### Paso 3. Prepara las carpetas y archivos

```sh
mkdir -p ~/.config/opencode/assets/images ~/.config/opencode/assets/sounds
```

Guarda los recursos con esta estructura:

```text
/home/TU_USUARIO/.config/opencode/
├── opencode.jsonc
├── notify.json
└── assets/
    ├── images/
    │   └── popup.png
    └── sounds/
        ├── complete.wav
        ├── error.wav
        └── attention.wav
```

El PNG debe medir exactamente `64x64` y pesar como máximo 2 MB. Puedes leer las
dimensiones directamente desde su cabecera sin instalar otra biblioteca:

```sh
python3 -c "import struct; f=open('$HOME/.config/opencode/assets/images/popup.png','rb'); f.seek(16); print('%dx%d' % struct.unpack('>II', f.read(8)))"
```

El resultado esperado es `64x64`. Para el sonido, WAV es la opción más portable.
Prueba el archivo con el reproductor encontrado en el paso anterior, por ejemplo:

```sh
canberra-gtk-play -f "$HOME/.config/opencode/assets/sounds/complete.wav"
```

También puedes usar `paplay`, `pw-play`, `ffplay -nodisp -autoexit` o `aplay`,
según lo que esté instalado.

#### Paso 4. Crea `notify.json`

Crea `~/.config/opencode/notify.json` y reemplaza `TU_USUARIO` por tu usuario
real:

```json
{
  "events": {
    "complete": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "error": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "permission": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "question": { "system": true, "sound": true, "popup": true, "titleFlash": false }
  },
  "sounds": {
    "complete": "/home/TU_USUARIO/.config/opencode/assets/sounds/complete.wav",
    "error": "/home/TU_USUARIO/.config/opencode/assets/sounds/error.wav",
    "permission": "/home/TU_USUARIO/.config/opencode/assets/sounds/attention.wav",
    "question": "/home/TU_USUARIO/.config/opencode/assets/sounds/attention.wav"
  },
  "popup": {
    "blinkColors": ["#0F172A", "#1E293B"],
    "blinkIntervalMs": 600,
    "fontFamily": "DejaVu Sans",
    "fontSize": 12,
    "textColor": "#FFFFFF",
    "opacity": 1,
    "image": {
      "enabled": true,
      "path": "./assets/images/popup.png",
      "position": "left"
    },
    "events": {
      "complete": { "blinkColors": ["#14532D", "#22C55E"], "textColor": "#FFFFFF" },
      "error": {
        "blinkColors": ["#7F1D1D", "#EF4444"],
        "textColor": "#FFFFFF",
        "image": { "position": "right" }
      },
      "permission": { "blinkColors": ["#78350F", "#F59E0B"], "textColor": "#111827" },
      "question": { "blinkColors": ["#312E81", "#6366F1"], "textColor": "#FFFFFF" }
    }
  }
}
```

Dentro de JSON, `~` y `$HOME` son texto normal y no se expanden. Por eso los
sonidos usan rutas absolutas. La imagen sí puede usar una ruta relativa porque el
plugin la resuelve desde la carpeta de `notify.json`.

Para ver las fuentes instaladas puedes ejecutar:

```sh
fc-list : family | sort -u
```

Reemplaza `DejaVu Sans` por cualquier familia disponible si quieres cambiar la
tipografía.

#### Paso 5. Reinicia y reconoce el backend

Cierra OpenCode por completo y vuelve a iniciarlo. Si ves el fondo coloreado y la
imagen junto al texto, se está utilizando Tkinter. Un diálogo de Zenity o una
notificación convencional indican que entró uno de los respaldos; seguirás
recibiendo el aviso, pero el escritorio controlará buena parte de su apariencia.

Si no aparece el toast del sistema, confirma que tu sesión gráfica tenga un
servicio de notificaciones activo. Si no suena el audio, ejecuta manualmente el
archivo con el backend detectado y revisa el volumen de la sesión.

### Variaciones útiles para ambas guías

Para usar una imagen distinta en cada evento, reemplaza solo `path`:

```json
{
  "popup": {
    "image": { "enabled": true, "path": "./assets/images/default.png", "position": "left" },
    "events": {
      "complete": { "image": { "path": "./assets/images/complete.png" } },
      "error": { "image": { "path": "./assets/images/error.png", "position": "right" } },
      "permission": { "image": { "enabled": false } }
    }
  }
}
```

Para quitar el sonido de un evento, el interruptor correcto está en `events`:

```json
{
  "events": {
    "complete": { "sound": false }
  }
}
```

La propiedad `messages.<evento>.icon` configura el icono del toast del sistema;
`popup.image` configura la imagen de la ventana personalizable. Son funciones
independientes.

> [!IMPORTANT]
> `notify.json` usa JSON estricto, por lo que no admite comentarios ni comas
> finales. Reinicia OpenCode después de cada cambio; la configuración se lee una
> sola vez durante la ejecución.

    "image": { "enabled": false, "position": "left" },
#### Imagen PNG

El popup admite una imagen PNG global para todos los eventos:

```json
{
  "popup": {
    "image": {
      "enabled": true,
      "path": "./images/opencode.png",
      "position": "left"
    }
  }
}
```

Cada evento puede reemplazar la ruta o posición global, o desactivar la imagen:

```json
{
  "popup": {
    "image": {
      "enabled": true,
      "path": "./images/default.png",
      "position": "left"
    },
    "events": {
      "complete": {
        "image": { "path": "./images/complete.png" }
      },
      "error": {
        "image": { "path": "C:/Images/error.png", "position": "right" }
      },
      "permission": {
        "image": { "enabled": false }
      }
    }
  }
}
```

- Solo se admiten archivos PNG locales de exactamente `64x64` píxeles y hasta 2 MB.
- `position` acepta `left` o `right`; cualquier otro valor usa `left`.
- Las rutas relativas se resuelven desde la carpeta que contiene `notify.json`.
- Una imagen específica hereda los campos omitidos de la imagen global.
- Si el archivo falta o no es válido, el popup continúa funcionando solo con texto.
- En Linux, la imagen completa requiere Tkinter; los fallbacks la usan como icono.

La propiedad `messages.<evento>.icon` continúa siendo independiente y pertenece
al toast del sistema.

#### Campos disponibles

| `image` | objeto | PNG opcional global de `64x64`, con posición izquierda o derecha |
| Popup | WinForms, PNG y estilos | Tkinter con PNG y fallbacks básicos | Alerta de AppleScript |
```

**notify.example.json** (+1 línea)**

```
    "image": { "enabled": false, "position": "left" },
```

**package-lock.json** (+2 líneas)**

```
  "version": "0.3.0",
      "version": "0.3.0",
```

**package.json** (+1 línea)**

```
  "version": "0.3.0",
```

**src/domain/entity/PopupConfig.ts** (+2 líneas)**

```
import type { PopupStyle, PopupStyleOverride } from "./PopupStyle.js";
  events: Partial<Record<EventType, PopupStyleOverride>>;
```

**src/domain/entity/PopupStyle.ts** (+7 líneas)**

```
import type { PopupImage } from "./PopupImage.js";

  image: PopupImage;
};

export type PopupStyleOverride = Partial<Omit<PopupStyle, "image">> & {
  image?: Partial<PopupImage>;
```

**src/helpers/linux/popup.ts** (+46 líneas)**

```
  "image = style.get('image') or {}",
  "image_enabled = bool(image.get('enabled'))",
  "image_path = image.get('path') or ''",
  "image_position = 'right' if image.get('position') == 'right' else 'left'",
  "root.configure(bg=colors[0])",
  "container = tk.Frame(root, bg=colors[0], borderwidth=0, highlightthickness=0)",
  "container.pack()",
  "label = tk.Label(container, text=title + '\\n\\n' + message, bg=colors[0], fg=foreground, font=(font_family, font_size), borderwidth=0, highlightthickness=0, justify='left')",
  "image_photo = None",
  "image_label = None",
  "if image_enabled and image_path:",
  "    try:",
  "        image_photo = tk.PhotoImage(file=image_path)",
  "        if image_photo.width() != 64 or image_photo.height() != 64:",
  "            raise ValueError('PNG must be 64x64')",
  "    except (tk.TclError, ValueError):",
  "        image_photo = None",
  "if image_photo is not None:",
  "    image_label = tk.Label(container, image=image_photo, bg=colors[0], borderwidth=0, highlightthickness=0)",
  "    if image_position == 'right':",
  "        label.pack(side='left', padx=(20, 12), pady=20)",
  "        image_label.pack(side='left', padx=(0, 20), pady=20)",
  "    else:",
  "        image_label.pack(side='left', padx=(20, 0), pady=20)",
  "        label.pack(side='left', padx=(12, 20), pady=20)",
  "else:",
  "    label.pack(padx=20, pady=20)",
  "def close_popup(_event=None):",
  "    root.destroy()",
  "root.bind('<Button-1>', close_popup)",
  "container.bind('<Button-1>', close_popup)",
  "label.bind('<Button-1>', close_popup)",
  "if image_label is not None:",
  "    image_label.bind('<Button-1>', close_popup)",
  "        color = colors[color_index]",
  "        root.configure(bg=color)",
  "        container.configure(bg=color)",
  "        label.configure(bg=color)",
  "        if image_label is not None:",
  "            image_label.configure(bg=color)",
  "  if [ -n \"$POPUP_IMAGE_PATH\" ]; then",
  "    exec zenity --info --title=\"$POPUP_TITLE\" --text=\"$POPUP_MESSAGE\" --no-wrap --window-icon=\"$POPUP_IMAGE_PATH\"",
  "  fi",
  "  if [ -n \"$POPUP_IMAGE_PATH\" ]; then",
  "    exec notify-send -u critical -t 0 -i \"$POPUP_IMAGE_PATH\" \"$POPUP_TITLE\" \"$POPUP_MESSAGE\"",
  "  fi",
```

**src/infrastructure/adapter/JsonConfigLoader.ts** (+25 líneas)**

```
import { dirname, isAbsolute, join, resolve } from "node:path";
import type { PopupConfig } from "../../domain/entity/PopupConfig.js";
import { EventType } from "../../domain/enum/EventType.js";
      return this.resolveImagePaths(NotifyConfigMapper.toDomain(source));

  private resolveImagePaths(config: NotifyConfig): NotifyConfig {
    const events = { ...config.popup.events };
    for (const type of Object.values(EventType)) {
      const style = events[type];
      if (style?.image) events[type] = { ...style, image: this.resolveImagePath(style.image) };
    }
    return {
      ...config,
      popup: {
        ...config.popup,
        image: this.resolveImagePath(config.popup.image),
        events: events as PopupConfig["events"],
      },
    };
  }

  private resolveImagePath<T extends { path?: string }>(image: T): T {
    if (!image.path || isAbsolute(image.path)) return image;
    return { ...image, path: resolve(dirname(resolve(this.path)), image.path) };
  }
```

**src/infrastructure/adapter/NativePersistentPopup.ts** (+107 líneas)**

```
import { open, stat } from "node:fs/promises";
import { extname } from "node:path";
import type { Logger } from "../../domain/port/out/Logger.js";
  private static readonly MAX_PNG_BYTES = 2 * 1024 * 1024;
    private readonly logger?: Logger,
    const style = await this.style(message);
      POPUP_STYLE: JSON.stringify(style),
      POPUP_IMAGE_PATH: style.image.enabled ? style.image.path : "",
    const override = events[message.kind];
    const image = { ...globalStyle.image, ...override?.image };
    return this.validateImage({
      ...globalStyle,
      ...override,
      image: { ...image, position: image.position === "right" ? "right" : "left" },
    });
  }

  private async validateImage(style: PopupStyle): Promise<PopupStyle> {
    const path = style.image.path;
    if (!style.image.enabled) return style;
    if (!path) return this.disableImage(style, "missing path");
    if (extname(path).toLowerCase() !== ".png") return this.disableImage(style, "only PNG files are supported");

    try {
      const fileStat = await stat(path);
      if (!fileStat.isFile()) return this.disableImage(style, "path is not a file");
      if (fileStat.size > NativePersistentPopup.MAX_PNG_BYTES) {
        return this.disableImage(style, "file exceeds 2 MB");
      }

      const handle = await open(path, "r");
      try {
        const header = Buffer.alloc(24);
        const { bytesRead } = await handle.read(header, 0, header.length, 0);
        const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        const validHeader =
          bytesRead === header.length &&
          header.subarray(0, signature.length).equals(signature) &&
          header.toString("ascii", 12, 16) === "IHDR";
        if (!validHeader) return this.disableImage(style, "invalid PNG header");
        const width = header.readUInt32BE(16);
        const height = header.readUInt32BE(20);
        if (width !== 64 || height !== 64) return this.disableImage(style, `expected 64x64, received ${width}x${height}`);
      } finally {
        await handle.close();
      }
    } catch (error) {
      return this.disableImage(style, error instanceof Error ? error.message : String(error));
    }
    return style;
  }

  private disableImage(style: PopupStyle, reason: string): PopupStyle {
    this.logger?.warn(`popup image ignored (${reason}): ${style.image.path ?? "<empty>"}`);
    return { ...style, image: { ...style.image, enabled: false } };
      'if (-not $styleJson) { $styleJson = \'{"blinkColors":["#FFC800","#FF5050"],"blinkIntervalMs":600,"fontFamily":"Segoe UI","fontSize":12,"textColor":"#111111","opacity":1,"image":{"enabled":false,"position":"left"}}\' }',
      "$label.BackColor = [System.Drawing.Color]::Transparent",
      "$picture = $null",
      "$content = $null",
      "$imageLoaded = $false",
      "if ($style.image.enabled -and $style.image.path -and (Test-Path -LiteralPath $style.image.path -PathType Leaf)) {",
      "  try {",
      "    $picture = New-Object System.Windows.Forms.PictureBox",
      "    $picture.Width = 64",
      "    $picture.Height = 64",
      '    $picture.SizeMode = "Zoom"',
      "    $picture.BackColor = [System.Drawing.Color]::Transparent",
      "    $sourceImage = [System.Drawing.Image]::FromFile([string]$style.image.path)",
      "    try { $picture.Image = [System.Drawing.Bitmap]::new($sourceImage) } finally { $sourceImage.Dispose() }",
      "    $content = New-Object System.Windows.Forms.FlowLayoutPanel",
      "    $content.AutoSize = $true",
      '    $content.AutoSizeMode = "GrowAndShrink"',
      '    $content.FlowDirection = "LeftToRight"',
      "    $content.WrapContents = $false",
      "    $content.Margin = [System.Windows.Forms.Padding]::new(0)",
      "    $content.Padding = [System.Windows.Forms.Padding]::new(0)",
      "    $content.BackColor = [System.Drawing.Color]::Transparent",
      '    if ($style.image.position -eq "right") {',
      "      $label.Padding = [System.Windows.Forms.Padding]::new(20, 20, 12, 20)",
      "      $picture.Margin = [System.Windows.Forms.Padding]::new(0, 20, 20, 20)",
      "      $content.Controls.Add($label) | Out-Null",
      "      $content.Controls.Add($picture) | Out-Null",
      "    } else {",
      "      $picture.Margin = [System.Windows.Forms.Padding]::new(20, 20, 0, 20)",
      "      $label.Padding = [System.Windows.Forms.Padding]::new(12, 20, 20, 20)",
      "      $content.Controls.Add($picture) | Out-Null",
      "      $content.Controls.Add($label) | Out-Null",
      "    }",
      "    $form.Controls.Add($content)",
      "    $imageLoaded = $true",
      "  } catch {",
      "    if ($picture -and $picture.Image) { $picture.Image.Dispose() }",
      "    $picture = $null",
      "    $content = $null",
      "  }",
      "}",
      "if (-not $imageLoaded) {",
      "  $label.Padding = [System.Windows.Forms.Padding]::new(20)",
      "  $form.Controls.Add($label)",
      "}",
      "  $form.BackColor = $colors[0]",
      "$activatePopup = { $script:activated = $true; Add-Content -Path $diag -Value \"click fg=$([Focuser]::GetForegroundWindow()) target=$script:target\"; Focus-Terminal; $form.Close() }",
      "$form.Add_Click($activatePopup)",
      "$label.Add_Click($activatePopup)",
      "if ($content) { $content.Add_Click($activatePopup) }",
      "if ($picture) { $picture.Add_Click($activatePopup) }",
      "$form.Add_FormClosed({ if ($picture -and $picture.Image) { $picture.Image.Dispose() } })",
```

**src/infrastructure/adapter/entity/NotifyConfigFile.ts** (+22 líneas)**

```
import type { ChannelConfig } from "../../../domain/entity/ChannelConfig.js";
import type { NotificationTemplate } from "../../../domain/entity/NotificationTemplate.js";
import type { PopupStyleOverride } from "../../../domain/entity/PopupStyle.js";
import type { QuietHoursConfig } from "../../../domain/entity/QuietHoursConfig.js";
import type { TitleFlashConfig } from "../../../domain/entity/TitleFlashConfig.js";
import type { ToastConfig } from "../../../domain/entity/ToastConfig.js";
import type { EventType } from "../../../domain/enum/EventType.js";
type PopupConfigFile = PopupStyleOverride & {
  events?: Partial<Record<EventType, PopupStyleOverride>>;
};

export type NotifyConfigFile = {
  events?: Partial<Record<EventType, Partial<ChannelConfig>>>;
  messages?: Partial<Record<EventType, Partial<NotificationTemplate>>>;
  sounds?: Partial<Record<EventType, string>>;
  cooldownMs?: number;
  quietHours?: Partial<QuietHoursConfig>;
  onlyMainSessions?: boolean;
  toast?: Partial<ToastConfig>;
  titleFlash?: Partial<TitleFlashConfig>;
  popup?: PopupConfigFile;
};
```

**src/infrastructure/adapter/mapper/NotifyConfigMapper.ts** (+18 líneas)**

```
    const popupEvent = (type: EventType) => {
      const defaults = DEFAULT_NOTIFY_CONFIG.popup.events[type];
      const override = source.popup?.events?.[type];
      if (!defaults) return override;
      if (!override) return defaults;
      return {
        ...defaults,
        ...override,
        image: defaults.image || override.image ? { ...defaults.image, ...override.image } : undefined,
      };
    };
        image: { ...DEFAULT_NOTIFY_CONFIG.popup.image, ...source.popup?.image },
        events: {
          [EventType.Complete]: popupEvent(EventType.Complete),
          [EventType.Error]: popupEvent(EventType.Error),
          [EventType.Permission]: popupEvent(EventType.Permission),
          [EventType.Question]: popupEvent(EventType.Question),
        },
```

**src/infrastructure/config/defaultNotifyConfig.ts** (+1 línea)**

```
  image: { enabled: false, position: "left" },
```

**src/infrastructure/plugin.ts** (+1 línea)**

```
  }, logger);
```

**test/verify.ts** (+96 líneas)**

```
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
      image: { enabled: true, path: "./global.png", position: "right" },
        error: { blinkColors: ["#7F1D1D", "#EF4444"], image: { path: "./error.png", position: "left" } },
        permission: { image: { enabled: false } },
check(loadedConfig.popup.image.path === globalImagePath, "ruta PNG global se resuelve desde notify.json");
check(loadedConfig.popup.events.error?.image?.path === errorImagePath, "ruta PNG por evento se resuelve desde notify.json");
  env(message: NotificationMessage): Promise<NodeJS.ProcessEnv>;
  style(message: NotificationMessage): Promise<{
    blinkColors: string[];
    textColor: string;
    fontSize: number;
    image: { enabled: boolean; path?: string; position: string };
  }>;
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
check(!defaults.popup.image.enabled && defaults.popup.image.position === "left", "imagen popup viene desactivada por defecto");
check(
  LINUX_POPUP_PY.includes("tk.PhotoImage") && LINUX_POPUP_PY.includes("image_position") && LINUX_POPUP_PY.includes("64"),
  "popup Tkinter carga PNG 64x64 a izquierda o derecha",
);
check(
  LINUX_POPUP_SH.includes("--window-icon") && LINUX_POPUP_SH.includes("notify-send -u critical -t 0 -i"),
  "fallbacks Linux reciben el PNG como icono",
);
check(
  popupScript.includes("System.Windows.Forms.PictureBox") &&
    popupScript.includes("System.Drawing.Image]::FromFile") &&
    popupScript.includes("$picture.Add_Click"),
  "popup Windows muestra PNG y conserva activación por clic",
);
check(popupScript.includes("$picture.Image.Dispose()"), "popup Windows libera la imagen al cerrar");
```

---

## 🕐 07/08/2026, 22:34:20

### 📊 Resumen
- **Total archivos:** 16
- **📝 Nuevos:** 1
- **✏️ Modificados:** 15
- **🗑️ Eliminados:** 0
- **Líneas añadidas:** +796
- **Líneas eliminadas:** -42
- **Balance neto:** +754 líneas

### 📝 Detalle por archivo

| Estado | Archivo | Añadidas | Eliminadas | Neto |
|--------|---------|----------|------------|------|
| 🆕 | `src/domain/entity/PopupImage.ts` | nuevo | -0 | 0 |
| ✏️ | `README.md` | +460 | -17 | +443 |
| ✏️ | `src/infrastructure/adapter/NativePersistentPopup.ts` | +107 | -7 | +100 |
| ✏️ | `test/verify.ts` | +96 | -2 | +94 |
| ✏️ | `src/helpers/linux/popup.ts` | +46 | -5 | +41 |
| ✏️ | `src/infrastructure/adapter/JsonConfigLoader.ts` | +25 | -2 | +23 |
| ✏️ | `src/infrastructure/adapter/entity/NotifyConfigFile.ts` | +22 | -2 | +20 |
| ✏️ | `src/infrastructure/adapter/mapper/NotifyConfigMapper.ts` | +18 | -1 | +17 |
| ✏️ | `CHANGELOG.md` | +7 | -0 | +7 |
| ✏️ | `src/domain/entity/PopupStyle.ts` | +7 | -0 | +7 |
| ✏️ | `package-lock.json` | +2 | -2 | 0 |
| ✏️ | `src/domain/entity/PopupConfig.ts` | +2 | -2 | 0 |
| ✏️ | `package.json` | +1 | -1 | 0 |
| ✏️ | `src/infrastructure/plugin.ts` | +1 | -1 | 0 |
| ✏️ | `notify.example.json` | +1 | -0 | +1 |
| ✏️ | `src/infrastructure/config/defaultNotifyConfig.ts` | +1 | -0 | +1 |

### 📁 Lista completa

<details>
<summary>Ver todos los archivos (16)</summary>

**🆕 Nuevos:**
```
src/domain/entity/PopupImage.ts
```

**✏️ Modificados:**
```
README.md
src/infrastructure/adapter/NativePersistentPopup.ts
test/verify.ts
src/helpers/linux/popup.ts
src/infrastructure/adapter/JsonConfigLoader.ts
src/infrastructure/adapter/entity/NotifyConfigFile.ts
src/infrastructure/adapter/mapper/NotifyConfigMapper.ts
CHANGELOG.md
src/domain/entity/PopupStyle.ts
package-lock.json
src/domain/entity/PopupConfig.ts
package.json
src/infrastructure/plugin.ts
notify.example.json
src/infrastructure/config/defaultNotifyConfig.ts
```

</details>

### 💻 Código Añadido

**CHANGELOG.md** (+7 líneas)**

```
## 0.3.0

- Add optional local 64x64 PNG images to Windows and Linux popups.
- Support one global popup image or per-event image overrides.
- Resolve relative image paths from the directory containing `notify.json`.
- Support left and right image placement with safe text-only fallback.

```

**README.md** (+460 líneas)**

```
    "opencode-desktop-notify@0.3.0"
Reinicia OpenCode después del cambio. En una versión futura, reemplaza `0.3.0`
## Guías completas por sistema

Estas dos guías parten desde cero y terminan con colores, una imagen PNG y
sonidos propios. No necesitas instalar el paquete con npm: OpenCode se encarga de
descargarlo cuando encuentra su nombre en `opencode.jsonc`.

- [Guía 1: Windows desde cero](#guia-windows)
- [Guía 2: Linux desde cero](#guia-linux)

Antes de comenzar, conviene entender cómo se arma cada aviso:

| Bloque | Qué controla |
| --- | --- |
| `events.<evento>` | Activa o desactiva toast, sonido, popup y título |
| `sounds.<evento>` | Selecciona el archivo de audio de ese evento |
| `popup` | Define fuente, tamaño, opacidad, velocidad e imagen global |
| `popup.events.<evento>` | Reemplaza solo los estilos indicados para ese evento |
| `messages.<evento>` | Cambia el título y texto que verá el usuario |

Los nombres de evento disponibles son `complete`, `error`, `permission` y
`question`. Todos los campos son opcionales y los valores omitidos conservan la
configuración predeterminada.

<a id="guia-windows"></a>

### Guía 1: Windows desde cero

Windows no necesita una biblioteca gráfica adicional. El popup utiliza
WinForms y System.Drawing a través de Windows PowerShell 5.1, componentes que ya
forman parte de Windows 10 y Windows 11.

#### Paso 1. Activa el plugin

Crea o abre `%USERPROFILE%\.config\opencode\opencode.jsonc` y añade:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-desktop-notify"
  ]
}
```

Si ya hay otros proveedores, modelos o plugins, conserva esas propiedades y
añade únicamente la entrada `opencode-desktop-notify` al arreglo existente.

#### Paso 2. Prepara las carpetas

Ejecuta en PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path `
  "$HOME\.config\opencode\assets\images", `
  "$HOME\.config\opencode\assets\sounds"
```

La estructura resultante será similar a esta:

```text
C:\Users\TU_USUARIO\.config\opencode\
├── opencode.jsonc
├── notify.json
└── assets\
    ├── images\
    │   └── popup.png
    └── sounds\
        ├── complete.wav
        ├── error.wav
        └── attention.wav
```

#### Paso 3. Prepara la imagen y los sonidos

La imagen debe cumplir estas reglas:

- Formato PNG local, no URL ni GIF.
- Dimensiones exactas de `64x64` píxeles; el plugin no la redimensiona.
- Tamaño máximo de 2 MB.
- Puede tener transparencia.

Guarda la imagen como
`%USERPROFILE%\.config\opencode\assets\images\popup.png`. Puedes comprobar sus
dimensiones con PowerShell:

```powershell
Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Image]::FromFile("$HOME\.config\opencode\assets\images\popup.png")
"$($image.Width)x$($image.Height)"
$image.Dispose()
```

El resultado debe ser `64x64`.

Para Windows, usa archivos WAV. PCM WAV es la opción más compatible con
`Media.SoundPlayer`. Prueba uno antes de configurar el plugin:

```powershell
(New-Object Media.SoundPlayer "$HOME\.config\opencode\assets\sounds\complete.wav").PlaySync()
```

#### Paso 4. Crea `notify.json`

Crea `%USERPROFILE%\.config\opencode\notify.json` con esta configuración y
reemplaza `TU_USUARIO` en las rutas de sonido:

```json
{
  "events": {
    "complete": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "error": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "permission": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "question": { "system": true, "sound": true, "popup": true, "titleFlash": false }
  },
  "sounds": {
    "complete": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/complete.wav",
    "error": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/error.wav",
    "permission": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/attention.wav",
    "question": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/attention.wav"
  },
  "popup": {
    "blinkColors": ["#0F172A", "#1E293B"],
    "blinkIntervalMs": 600,
    "fontFamily": "Segoe UI",
    "fontSize": 12,
    "textColor": "#FFFFFF",
    "opacity": 1,
    "image": {
      "enabled": true,
      "path": "./assets/images/popup.png",
      "position": "left"
    },
    "events": {
      "complete": { "blinkColors": ["#14532D", "#22C55E"], "textColor": "#FFFFFF" },
      "error": {
        "blinkColors": ["#7F1D1D", "#EF4444"],
        "textColor": "#FFFFFF",
        "image": { "position": "right" }
      },
      "permission": { "blinkColors": ["#78350F", "#F59E0B"], "textColor": "#111827" },
      "question": { "blinkColors": ["#312E81", "#6366F1"], "textColor": "#FFFFFF" }
    }
  }
}
```

Esta configuración produce los siguientes resultados:

| Evento | Apariencia | Sonido |
| --- | --- | --- |
| `complete` | Parpadeo verde, imagen a la izquierda | `complete.wav` |
| `error` | Parpadeo rojo, imagen a la derecha | `error.wav` |
| `permission` | Parpadeo ámbar, imagen a la izquierda | `attention.wav` |
| `question` | Parpadeo índigo, imagen a la izquierda | `attention.wav` |

La ruta de la imagen es relativa a `notify.json`. Las rutas de sonido son
absolutas porque no se expanden variables como `%USERPROFILE%` dentro del JSON.
En Windows puedes usar `/` como en el ejemplo o escapar cada `\` como `\\`.

#### Paso 5. Ajusta los colores

`blinkColors` acepta colores hexadecimales `#RRGGBB`:

```json
{ "blinkColors": ["#2563EB"] }
```

Un color mantiene el fondo estático. Dos o más colores crean el parpadeo y
`blinkIntervalMs` determina los milisegundos entre cada cambio. `textColor`
controla el contraste del texto, mientras que `opacity` acepta valores entre
`0.2` y `1`.

#### Paso 6. Reinicia y prueba

Cierra todas las instancias de OpenCode y vuelve a iniciarlo. Prueba una tarea
corta para obtener `complete`; una solicitud de permiso o una pregunta permiten
comprobar los demás estilos. En Windows, al pulsar cualquier parte del popup,
incluida la imagen, la terminal se restaura y recibe el foco.

<a id="guia-linux"></a>

### Guía 2: Linux desde cero

En Linux, Tkinter es la biblioteca gráfica que permite mostrar el popup completo
con colores, parpadeo, fuente, opacidad e imagen. No es una dependencia npm y el
plugin no puede instalarla automáticamente: se instala desde el gestor de
paquetes de la distribución.

El orden de backends gráficos es:

| Backend | Uso | Personalización disponible |
| --- | --- | --- |
| Tkinter | Primera opción | Colores, parpadeo, fuente, opacidad y PNG a izquierda o derecha |
| Zenity | Primer respaldo | Diálogo persistente e imagen como icono, sin colores propios |
| `notify-send` | Último respaldo | Notificación del escritorio e icono, apariencia controlada por el sistema |

#### Paso 1. Instala las dependencias

Usa el bloque correspondiente a tu distribución. Estos comandos instalan
Tkinter, los dos backends gráficos de respaldo y al menos un reproductor de
audio habitual.

```sh
# Debian / Ubuntu
sudo apt update
sudo apt install python3-tk zenity libnotify-bin gnome-session-canberra pulseaudio-utils
```

```sh
# Fedora
sudo dnf install python3-tkinter zenity libnotify libcanberra-gtk3 pulseaudio-utils
```

```sh
# Arch Linux
sudo pacman -S tk zenity libnotify libcanberra libpulse
```

Si tu equipo usa otro sistema de audio, también sirven `pw-play` de PipeWire,
`aplay` de ALSA o `ffplay` de FFmpeg. No necesitas instalarlos todos: basta con
que al menos uno pueda reproducir el formato elegido.

Verifica los componentes antes de continuar:

```sh
python3 -c "import tkinter; print('Tkinter', tkinter.TkVersion)"
command -v zenity
command -v notify-send
command -v canberra-gtk-play || command -v paplay || command -v pw-play || command -v ffplay || command -v aplay
```

La primera línea debe imprimir la versión de Tk. En las demás líneas basta con
que aparezca la ruta de un backend gráfico de respaldo y de un reproductor de
audio.

#### Paso 2. Activa el plugin

Crea o abre `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-desktop-notify"
  ]
}
```

No ejecutes `npm install` para una instalación normal. OpenCode descargará y
mantendrá el plugin en su propia caché.

#### Paso 3. Prepara las carpetas y archivos

```sh
mkdir -p ~/.config/opencode/assets/images ~/.config/opencode/assets/sounds
```

Guarda los recursos con esta estructura:

```text
/home/TU_USUARIO/.config/opencode/
├── opencode.jsonc
├── notify.json
└── assets/
    ├── images/
    │   └── popup.png
    └── sounds/
        ├── complete.wav
        ├── error.wav
        └── attention.wav
```

El PNG debe medir exactamente `64x64` y pesar como máximo 2 MB. Puedes leer las
dimensiones directamente desde su cabecera sin instalar otra biblioteca:

```sh
python3 -c "import struct; f=open('$HOME/.config/opencode/assets/images/popup.png','rb'); f.seek(16); print('%dx%d' % struct.unpack('>II', f.read(8)))"
```

El resultado esperado es `64x64`. Para el sonido, WAV es la opción más portable.
Prueba el archivo con el reproductor encontrado en el paso anterior, por ejemplo:

```sh
canberra-gtk-play -f "$HOME/.config/opencode/assets/sounds/complete.wav"
```

También puedes usar `paplay`, `pw-play`, `ffplay -nodisp -autoexit` o `aplay`,
según lo que esté instalado.

#### Paso 4. Crea `notify.json`

Crea `~/.config/opencode/notify.json` y reemplaza `TU_USUARIO` por tu usuario
real:

```json
{
  "events": {
    "complete": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "error": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "permission": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "question": { "system": true, "sound": true, "popup": true, "titleFlash": false }
  },
  "sounds": {
    "complete": "/home/TU_USUARIO/.config/opencode/assets/sounds/complete.wav",
    "error": "/home/TU_USUARIO/.config/opencode/assets/sounds/error.wav",
    "permission": "/home/TU_USUARIO/.config/opencode/assets/sounds/attention.wav",
    "question": "/home/TU_USUARIO/.config/opencode/assets/sounds/attention.wav"
  },
  "popup": {
    "blinkColors": ["#0F172A", "#1E293B"],
    "blinkIntervalMs": 600,
    "fontFamily": "DejaVu Sans",
    "fontSize": 12,
    "textColor": "#FFFFFF",
    "opacity": 1,
    "image": {
      "enabled": true,
      "path": "./assets/images/popup.png",
      "position": "left"
    },
    "events": {
      "complete": { "blinkColors": ["#14532D", "#22C55E"], "textColor": "#FFFFFF" },
      "error": {
        "blinkColors": ["#7F1D1D", "#EF4444"],
        "textColor": "#FFFFFF",
        "image": { "position": "right" }
      },
      "permission": { "blinkColors": ["#78350F", "#F59E0B"], "textColor": "#111827" },
      "question": { "blinkColors": ["#312E81", "#6366F1"], "textColor": "#FFFFFF" }
    }
  }
}
```

Dentro de JSON, `~` y `$HOME` son texto normal y no se expanden. Por eso los
sonidos usan rutas absolutas. La imagen sí puede usar una ruta relativa porque el
plugin la resuelve desde la carpeta de `notify.json`.

Para cambiar los colores, edita `popup.events.<evento>.blinkColors`. Un solo
color deja el fondo estático; dos o más colores activan el parpadeo con la
velocidad de `blinkIntervalMs`. Ajusta también `textColor` para mantener una buena
legibilidad.

Para ver las fuentes instaladas puedes ejecutar:

```sh
fc-list : family | sort -u
```

Reemplaza `DejaVu Sans` por cualquier familia disponible si quieres cambiar la
tipografía.

#### Paso 5. Reinicia y reconoce el backend

Cierra OpenCode por completo y vuelve a iniciarlo. Si ves el fondo coloreado y la
imagen junto al texto, se está utilizando Tkinter. Un diálogo de Zenity o una
notificación convencional indican que entró uno de los respaldos; seguirás
recibiendo el aviso, pero el escritorio controlará buena parte de su apariencia.

Si no aparece el toast del sistema, confirma que tu sesión gráfica tenga un
servicio de notificaciones activo. Si no suena el audio, ejecuta manualmente el
archivo con el backend detectado y revisa el volumen de la sesión.

### Variaciones útiles para ambas guías

Para usar una imagen distinta en cada evento, reemplaza solo `path`:

```json
{
  "popup": {
    "image": { "enabled": true, "path": "./assets/images/default.png", "position": "left" },
    "events": {
      "complete": { "image": { "path": "./assets/images/complete.png" } },
      "error": { "image": { "path": "./assets/images/error.png", "position": "right" } },
      "permission": { "image": { "enabled": false } }
    }
  }
}
```

Para quitar el sonido de un evento, el interruptor correcto está en `events`:

```json
{
  "events": {
    "complete": { "sound": false }
  }
}
```

La propiedad `messages.<evento>.icon` configura el icono del toast del sistema;
`popup.image` configura la imagen de la ventana personalizable. Son funciones
independientes.

> [!IMPORTANT]
> `notify.json` usa JSON estricto, por lo que no admite comentarios ni comas
> finales. Reinicia OpenCode después de cada cambio; la configuración se lee una
> sola vez durante la ejecución.

    "image": { "enabled": false, "position": "left" },
#### Imagen PNG

El popup admite una imagen PNG global para todos los eventos:

```json
{
  "popup": {
    "image": {
      "enabled": true,
      "path": "./images/opencode.png",
      "position": "left"
    }
  }
}
```

Cada evento puede reemplazar la ruta o posición global, o desactivar la imagen:

```json
{
  "popup": {
    "image": {
      "enabled": true,
      "path": "./images/default.png",
      "position": "left"
    },
    "events": {
      "complete": {
        "image": { "path": "./images/complete.png" }
      },
      "error": {
        "image": { "path": "C:/Images/error.png", "position": "right" }
      },
      "permission": {
        "image": { "enabled": false }
      }
    }
  }
}
```

- Solo se admiten archivos PNG locales de exactamente `64x64` píxeles y hasta 2 MB.
- `position` acepta `left` o `right`; cualquier otro valor usa `left`.
- Las rutas relativas se resuelven desde la carpeta que contiene `notify.json`.
- Una imagen específica hereda los campos omitidos de la imagen global.
- Si el archivo falta o no es válido, el popup continúa funcionando solo con texto.
- En Linux, la imagen completa requiere Tkinter; los fallbacks la usan como icono.

La propiedad `messages.<evento>.icon` continúa siendo independiente y pertenece
al toast del sistema.

#### Campos disponibles

| `image` | objeto | PNG opcional global de `64x64`, con posición izquierda o derecha |
| Popup | WinForms, PNG y estilos | Tkinter con PNG y fallbacks básicos | Alerta de AppleScript |
No es obligatorio instalarlos todos: basta con un backend gráfico y uno de
audio. La [guía de Linux](#guia-linux) incluye los paquetes exactos para Debian,
Ubuntu, Fedora y Arch, junto con comandos de comprobación.
```

**notify.example.json** (+1 línea)**

```
    "image": { "enabled": false, "position": "left" },
```

**package-lock.json** (+2 líneas)**

```
  "version": "0.3.0",
      "version": "0.3.0",
```

**package.json** (+1 línea)**

```
  "version": "0.3.0",
```

**src/domain/entity/PopupConfig.ts** (+2 líneas)**

```
import type { PopupStyle, PopupStyleOverride } from "./PopupStyle.js";
  events: Partial<Record<EventType, PopupStyleOverride>>;
```

**src/domain/entity/PopupStyle.ts** (+7 líneas)**

```
import type { PopupImage } from "./PopupImage.js";

  image: PopupImage;
};

export type PopupStyleOverride = Partial<Omit<PopupStyle, "image">> & {
  image?: Partial<PopupImage>;
```

**src/helpers/linux/popup.ts** (+46 líneas)**

```
  "image = style.get('image') or {}",
  "image_enabled = bool(image.get('enabled'))",
  "image_path = image.get('path') or ''",
  "image_position = 'right' if image.get('position') == 'right' else 'left'",
  "root.configure(bg=colors[0])",
  "container = tk.Frame(root, bg=colors[0], borderwidth=0, highlightthickness=0)",
  "container.pack()",
  "label = tk.Label(container, text=title + '\\n\\n' + message, bg=colors[0], fg=foreground, font=(font_family, font_size), borderwidth=0, highlightthickness=0, justify='left')",
  "image_photo = None",
  "image_label = None",
  "if image_enabled and image_path:",
  "    try:",
  "        image_photo = tk.PhotoImage(file=image_path)",
  "        if image_photo.width() != 64 or image_photo.height() != 64:",
  "            raise ValueError('PNG must be 64x64')",
  "    except (tk.TclError, ValueError):",
  "        image_photo = None",
  "if image_photo is not None:",
  "    image_label = tk.Label(container, image=image_photo, bg=colors[0], borderwidth=0, highlightthickness=0)",
  "    if image_position == 'right':",
  "        label.pack(side='left', padx=(20, 12), pady=20)",
  "        image_label.pack(side='left', padx=(0, 20), pady=20)",
  "    else:",
  "        image_label.pack(side='left', padx=(20, 0), pady=20)",
  "        label.pack(side='left', padx=(12, 20), pady=20)",
  "else:",
  "    label.pack(padx=20, pady=20)",
  "def close_popup(_event=None):",
  "    root.destroy()",
  "root.bind('<Button-1>', close_popup)",
  "container.bind('<Button-1>', close_popup)",
  "label.bind('<Button-1>', close_popup)",
  "if image_label is not None:",
  "    image_label.bind('<Button-1>', close_popup)",
  "        color = colors[color_index]",
  "        root.configure(bg=color)",
  "        container.configure(bg=color)",
  "        label.configure(bg=color)",
  "        if image_label is not None:",
  "            image_label.configure(bg=color)",
  "  if [ -n \"$POPUP_IMAGE_PATH\" ]; then",
  "    exec zenity --info --title=\"$POPUP_TITLE\" --text=\"$POPUP_MESSAGE\" --no-wrap --window-icon=\"$POPUP_IMAGE_PATH\"",
  "  fi",
  "  if [ -n \"$POPUP_IMAGE_PATH\" ]; then",
  "    exec notify-send -u critical -t 0 -i \"$POPUP_IMAGE_PATH\" \"$POPUP_TITLE\" \"$POPUP_MESSAGE\"",
  "  fi",
```

**src/infrastructure/adapter/JsonConfigLoader.ts** (+25 líneas)**

```
import { dirname, isAbsolute, join, resolve } from "node:path";
import type { PopupConfig } from "../../domain/entity/PopupConfig.js";
import { EventType } from "../../domain/enum/EventType.js";
      return this.resolveImagePaths(NotifyConfigMapper.toDomain(source));

  private resolveImagePaths(config: NotifyConfig): NotifyConfig {
    const events = { ...config.popup.events };
    for (const type of Object.values(EventType)) {
      const style = events[type];
      if (style?.image) events[type] = { ...style, image: this.resolveImagePath(style.image) };
    }
    return {
      ...config,
      popup: {
        ...config.popup,
        image: this.resolveImagePath(config.popup.image),
        events: events as PopupConfig["events"],
      },
    };
  }

  private resolveImagePath<T extends { path?: string }>(image: T): T {
    if (!image.path || isAbsolute(image.path)) return image;
    return { ...image, path: resolve(dirname(resolve(this.path)), image.path) };
  }
```

**src/infrastructure/adapter/NativePersistentPopup.ts** (+107 líneas)**

```
import { open, stat } from "node:fs/promises";
import { extname } from "node:path";
import type { Logger } from "../../domain/port/out/Logger.js";
  private static readonly MAX_PNG_BYTES = 2 * 1024 * 1024;
    private readonly logger?: Logger,
    const style = await this.style(message);
      POPUP_STYLE: JSON.stringify(style),
      POPUP_IMAGE_PATH: style.image.enabled ? style.image.path : "",
    const override = events[message.kind];
    const image = { ...globalStyle.image, ...override?.image };
    return this.validateImage({
      ...globalStyle,
      ...override,
      image: { ...image, position: image.position === "right" ? "right" : "left" },
    });
  }

  private async validateImage(style: PopupStyle): Promise<PopupStyle> {
    const path = style.image.path;
    if (!style.image.enabled) return style;
    if (!path) return this.disableImage(style, "missing path");
    if (extname(path).toLowerCase() !== ".png") return this.disableImage(style, "only PNG files are supported");

    try {
      const fileStat = await stat(path);
      if (!fileStat.isFile()) return this.disableImage(style, "path is not a file");
      if (fileStat.size > NativePersistentPopup.MAX_PNG_BYTES) {
        return this.disableImage(style, "file exceeds 2 MB");
      }

      const handle = await open(path, "r");
      try {
        const header = Buffer.alloc(24);
        const { bytesRead } = await handle.read(header, 0, header.length, 0);
        const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        const validHeader =
          bytesRead === header.length &&
          header.subarray(0, signature.length).equals(signature) &&
          header.toString("ascii", 12, 16) === "IHDR";
        if (!validHeader) return this.disableImage(style, "invalid PNG header");
        const width = header.readUInt32BE(16);
        const height = header.readUInt32BE(20);
        if (width !== 64 || height !== 64) return this.disableImage(style, `expected 64x64, received ${width}x${height}`);
      } finally {
        await handle.close();
      }
    } catch (error) {
      return this.disableImage(style, error instanceof Error ? error.message : String(error));
    }
    return style;
  }

  private disableImage(style: PopupStyle, reason: string): PopupStyle {
    this.logger?.warn(`popup image ignored (${reason}): ${style.image.path ?? "<empty>"}`);
    return { ...style, image: { ...style.image, enabled: false } };
      'if (-not $styleJson) { $styleJson = \'{"blinkColors":["#FFC800","#FF5050"],"blinkIntervalMs":600,"fontFamily":"Segoe UI","fontSize":12,"textColor":"#111111","opacity":1,"image":{"enabled":false,"position":"left"}}\' }',
      "$label.BackColor = [System.Drawing.Color]::Transparent",
      "$picture = $null",
      "$content = $null",
      "$imageLoaded = $false",
      "if ($style.image.enabled -and $style.image.path -and (Test-Path -LiteralPath $style.image.path -PathType Leaf)) {",
      "  try {",
      "    $picture = New-Object System.Windows.Forms.PictureBox",
      "    $picture.Width = 64",
      "    $picture.Height = 64",
      '    $picture.SizeMode = "Zoom"',
      "    $picture.BackColor = [System.Drawing.Color]::Transparent",
      "    $sourceImage = [System.Drawing.Image]::FromFile([string]$style.image.path)",
      "    try { $picture.Image = [System.Drawing.Bitmap]::new($sourceImage) } finally { $sourceImage.Dispose() }",
      "    $content = New-Object System.Windows.Forms.FlowLayoutPanel",
      "    $content.AutoSize = $true",
      '    $content.AutoSizeMode = "GrowAndShrink"',
      '    $content.FlowDirection = "LeftToRight"',
      "    $content.WrapContents = $false",
      "    $content.Margin = [System.Windows.Forms.Padding]::new(0)",
      "    $content.Padding = [System.Windows.Forms.Padding]::new(0)",
      "    $content.BackColor = [System.Drawing.Color]::Transparent",
      '    if ($style.image.position -eq "right") {',
      "      $label.Padding = [System.Windows.Forms.Padding]::new(20, 20, 12, 20)",
      "      $picture.Margin = [System.Windows.Forms.Padding]::new(0, 20, 20, 20)",
      "      $content.Controls.Add($label) | Out-Null",
      "      $content.Controls.Add($picture) | Out-Null",
      "    } else {",
      "      $picture.Margin = [System.Windows.Forms.Padding]::new(20, 20, 0, 20)",
      "      $label.Padding = [System.Windows.Forms.Padding]::new(12, 20, 20, 20)",
      "      $content.Controls.Add($picture) | Out-Null",
      "      $content.Controls.Add($label) | Out-Null",
      "    }",
      "    $form.Controls.Add($content)",
      "    $imageLoaded = $true",
      "  } catch {",
      "    if ($picture -and $picture.Image) { $picture.Image.Dispose() }",
      "    $picture = $null",
      "    $content = $null",
      "  }",
      "}",
      "if (-not $imageLoaded) {",
      "  $label.Padding = [System.Windows.Forms.Padding]::new(20)",
      "  $form.Controls.Add($label)",
      "}",
      "  $form.BackColor = $colors[0]",
      "$activatePopup = { $script:activated = $true; Add-Content -Path $diag -Value \"click fg=$([Focuser]::GetForegroundWindow()) target=$script:target\"; Focus-Terminal; $form.Close() }",
      "$form.Add_Click($activatePopup)",
      "$label.Add_Click($activatePopup)",
      "if ($content) { $content.Add_Click($activatePopup) }",
      "if ($picture) { $picture.Add_Click($activatePopup) }",
      "$form.Add_FormClosed({ if ($picture -and $picture.Image) { $picture.Image.Dispose() } })",
```

**src/infrastructure/adapter/entity/NotifyConfigFile.ts** (+22 líneas)**

```
import type { ChannelConfig } from "../../../domain/entity/ChannelConfig.js";
import type { NotificationTemplate } from "../../../domain/entity/NotificationTemplate.js";
import type { PopupStyleOverride } from "../../../domain/entity/PopupStyle.js";
import type { QuietHoursConfig } from "../../../domain/entity/QuietHoursConfig.js";
import type { TitleFlashConfig } from "../../../domain/entity/TitleFlashConfig.js";
import type { ToastConfig } from "../../../domain/entity/ToastConfig.js";
import type { EventType } from "../../../domain/enum/EventType.js";
type PopupConfigFile = PopupStyleOverride & {
  events?: Partial<Record<EventType, PopupStyleOverride>>;
};

export type NotifyConfigFile = {
  events?: Partial<Record<EventType, Partial<ChannelConfig>>>;
  messages?: Partial<Record<EventType, Partial<NotificationTemplate>>>;
  sounds?: Partial<Record<EventType, string>>;
  cooldownMs?: number;
  quietHours?: Partial<QuietHoursConfig>;
  onlyMainSessions?: boolean;
  toast?: Partial<ToastConfig>;
  titleFlash?: Partial<TitleFlashConfig>;
  popup?: PopupConfigFile;
};
```

**src/infrastructure/adapter/mapper/NotifyConfigMapper.ts** (+18 líneas)**

```
    const popupEvent = (type: EventType) => {
      const defaults = DEFAULT_NOTIFY_CONFIG.popup.events[type];
      const override = source.popup?.events?.[type];
      if (!defaults) return override;
      if (!override) return defaults;
      return {
        ...defaults,
        ...override,
        image: defaults.image || override.image ? { ...defaults.image, ...override.image } : undefined,
      };
    };
        image: { ...DEFAULT_NOTIFY_CONFIG.popup.image, ...source.popup?.image },
        events: {
          [EventType.Complete]: popupEvent(EventType.Complete),
          [EventType.Error]: popupEvent(EventType.Error),
          [EventType.Permission]: popupEvent(EventType.Permission),
          [EventType.Question]: popupEvent(EventType.Question),
        },
```

**src/infrastructure/config/defaultNotifyConfig.ts** (+1 línea)**

```
  image: { enabled: false, position: "left" },
```

**src/infrastructure/plugin.ts** (+1 línea)**

```
  }, logger);
```

**test/verify.ts** (+96 líneas)**

```
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
      image: { enabled: true, path: "./global.png", position: "right" },
        error: { blinkColors: ["#7F1D1D", "#EF4444"], image: { path: "./error.png", position: "left" } },
        permission: { image: { enabled: false } },
check(loadedConfig.popup.image.path === globalImagePath, "ruta PNG global se resuelve desde notify.json");
check(loadedConfig.popup.events.error?.image?.path === errorImagePath, "ruta PNG por evento se resuelve desde notify.json");
  env(message: NotificationMessage): Promise<NodeJS.ProcessEnv>;
  style(message: NotificationMessage): Promise<{
    blinkColors: string[];
    textColor: string;
    fontSize: number;
    image: { enabled: boolean; path?: string; position: string };
  }>;
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
check(!defaults.popup.image.enabled && defaults.popup.image.position === "left", "imagen popup viene desactivada por defecto");
check(
  LINUX_POPUP_PY.includes("tk.PhotoImage") && LINUX_POPUP_PY.includes("image_position") && LINUX_POPUP_PY.includes("64"),
  "popup Tkinter carga PNG 64x64 a izquierda o derecha",
);
check(
  LINUX_POPUP_SH.includes("--window-icon") && LINUX_POPUP_SH.includes("notify-send -u critical -t 0 -i"),
  "fallbacks Linux reciben el PNG como icono",
);
check(
  popupScript.includes("System.Windows.Forms.PictureBox") &&
    popupScript.includes("System.Drawing.Image]::FromFile") &&
    popupScript.includes("$picture.Add_Click"),
  "popup Windows muestra PNG y conserva activación por clic",
);
check(popupScript.includes("$picture.Image.Dispose()"), "popup Windows libera la imagen al cerrar");
```

---
