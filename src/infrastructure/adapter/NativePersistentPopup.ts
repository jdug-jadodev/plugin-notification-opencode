import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import sharp from "sharp";
import type { NotificationMessage } from "../../domain/entity/NotificationMessage.js";
import type { PopupStyle } from "../../domain/entity/PopupStyle.js";
import type { Logger } from "../../domain/port/out/Logger.js";
import type { NotifierConfig } from "../../domain/port/out/NotifierConfig.js";
import type { PersistentPopup } from "../../domain/port/out/PersistentPopup.js";
import { LINUX_POPUP_PY, LINUX_POPUP_SH } from "../../helpers/linux/popup.js";
import { FIND_TERMINAL_PS, FOCUSER_CS, FOCUS_TERMINAL_PS, NOACTIVATE_FORM_CS } from "../../helpers/win32/terminal.js";
import { DEFAULT_POPUP_CONFIG } from "../config/defaultNotifyConfig.js";

export class NativePersistentPopup implements PersistentPopup {
  private static readonly ACTIVATED_EXIT_CODE = 10;
  private static readonly MAX_PNG_BYTES = 2 * 1024 * 1024;
  private static readonly MAX_PNG_PIXELS = 4096 * 4096;
  private static readonly IMAGE_CACHE_DIR = join(tmpdir(), "opencode-desktop-notify", "images");
  private active: ChildProcess | undefined;
  private readonly imageTransforms = new Map<string, Promise<string>>();

  constructor(
    private readonly config?: NotifierConfig,
    private readonly platform: NodeJS.Platform = process.platform,
    private readonly onActivate?: () => void,
    private readonly logger?: Logger,
  ) {}

  async show(message: NotificationMessage): Promise<void> {
    this.dismiss();
    const command = this.command(message);
    if (!command) return;
    const env = await this.env(message);
    const child = spawn(command[0], command.slice(1), {
      stdio: "ignore",
      detached: this.platform !== "win32",
      windowsHide: this.platform === "win32",
      env,
    });
    this.active = child;
    child.unref();
    child.once("error", () => this.clear(child));
    child.once("exit", (code) => this.onExit(child, code));
  }

  private dismiss(): void {
    if (!this.active) return;
    try {
      this.active.kill();
    } catch {
      /* ignore */
    }
    this.active = undefined;
  }

  private clear(child: ChildProcess): boolean {
    if (this.active !== child) return false;
    this.active = undefined;
    return true;
  }

  private onExit(child: ChildProcess, code: number | null): void {
    if (!this.clear(child)) return;
    if (code === NativePersistentPopup.ACTIVATED_EXIT_CODE) this.onActivate?.();
  }

  private async env(message: NotificationMessage): Promise<NodeJS.ProcessEnv> {
    const style = await this.style(message);
    return {
      ...process.env,
      POPUP_TITLE: message.title,
      POPUP_MESSAGE: message.message,
      POPUP_STYLE: JSON.stringify(style),
      POPUP_IMAGE_PATH: style.image.enabled ? style.image.path : "",
      POPUP_LINUX_SCRIPT: LINUX_POPUP_PY,
    };
  }

  private async style(message: NotificationMessage): Promise<PopupStyle> {
    const popup = this.config ? (await this.config.get()).popup : DEFAULT_POPUP_CONFIG;
    const { events, ...globalStyle } = popup;
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

      const source = await readFile(path);
      const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const validHeader =
        source.length >= 24 &&
        source.subarray(0, signature.length).equals(signature) &&
        source.toString("ascii", 12, 16) === "IHDR";
      if (!validHeader) return this.disableImage(style, "invalid PNG header");

      const options = { failOn: "error" as const, limitInputPixels: NativePersistentPopup.MAX_PNG_PIXELS };
      const metadata = await sharp(source, options).metadata();
      if (metadata.format !== "png") return this.disableImage(style, "decoded image is not PNG");
      if ((metadata.pages ?? 1) > 1) return this.disableImage(style, "animated PNG files are not supported");
      if (!metadata.width || !metadata.height) return this.disableImage(style, "PNG dimensions are unavailable");
      if (metadata.width === 64 && metadata.height === 64) {
        await sharp(source, options).raw().toBuffer();
        return style;
      }

      const transformedPath = await this.transformImage(source, path, metadata.width, metadata.height);
      return { ...style, image: { ...style.image, path: transformedPath } };
    } catch (error) {
      return this.disableImage(style, error instanceof Error ? error.message : String(error));
    }
  }

  private async transformImage(source: Buffer, sourcePath: string, width: number, height: number): Promise<string> {
    const key = createHash("sha256").update("contain-64-v1").update(source).digest("hex");
    const active = this.imageTransforms.get(key);
    if (active) return active;

    const transformation = this.writeTransformedImage(source, key);
    this.imageTransforms.set(key, transformation);
    try {
      const outputPath = await transformation;
      this.logger?.debug(`popup image resized from ${width}x${height} to 64x64: ${sourcePath}`);
      return outputPath;
    } catch (error) {
      this.imageTransforms.delete(key);
      throw error;
    }
  }

  private async writeTransformedImage(source: Buffer, key: string): Promise<string> {
    await mkdir(NativePersistentPopup.IMAGE_CACHE_DIR, { recursive: true });
    const outputPath = join(NativePersistentPopup.IMAGE_CACHE_DIR, `${key}.png`);
    if (await this.isCachedImage(outputPath)) return outputPath;

    const temporaryPath = join(NativePersistentPopup.IMAGE_CACHE_DIR, `${key}.${process.pid}.${Date.now()}.tmp`);
    try {
      await sharp(source, { failOn: "error", limitInputPixels: NativePersistentPopup.MAX_PNG_PIXELS })
        .resize(64, 64, {
          fit: "contain",
          position: "centre",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(temporaryPath);
      try {
        await rename(temporaryPath, outputPath);
      } catch {
        if (!(await this.isCachedImage(outputPath))) {
          await rm(outputPath, { force: true });
          try {
            await rename(temporaryPath, outputPath);
          } catch (retryError) {
            if (!(await this.isCachedImage(outputPath))) throw retryError;
          }
        }
      }
      return outputPath;
    } finally {
      await rm(temporaryPath, { force: true });
    }
  }

  private async isCachedImage(path: string): Promise<boolean> {
    try {
      const metadata = await sharp(path, { limitInputPixels: 64 * 64 }).metadata();
      return metadata.format === "png" && metadata.width === 64 && metadata.height === 64;
    } catch {
      return false;
    }
  }

  private disableImage(style: PopupStyle, reason: string): PopupStyle {
    this.logger?.warn(`popup image ignored (${reason}): ${style.image.path ?? "<empty>"}`);
    return { ...style, image: { ...style.image, enabled: false } };
  }

  private command(message: NotificationMessage): string[] | undefined {
    switch (this.platform) {
      case "win32":
        return ["powershell", "-NoProfile", "-NonInteractive", "-STA", "-Command", this.windowsScript()];
      case "darwin":
        return ["osascript", "-e", `display alert "${this.quote(message.title)}" message "${this.quote(message.message)}"`];
      case "linux":
        return ["sh", "-c", LINUX_POPUP_SH];
      default:
        return undefined;
    }
  }

  private quote(text: string): string {
    return text.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  }

  private windowsScript(): string {
    return [
      "Add-Type -AssemblyName System.Windows.Forms",
      "Add-Type -AssemblyName System.Drawing",
      "$code = @'",
      FOCUSER_CS,
      "'@",
      "Add-Type $code",
      "$formCode = @'",
      NOACTIVATE_FORM_CS,
      "'@",
      "Add-Type -ReferencedAssemblies System.Windows.Forms,System.Drawing $formCode",
      FIND_TERMINAL_PS,
      FOCUS_TERMINAL_PS,
      "$script:terminalAtShow = ([Focuser]::GetForegroundWindow() -eq $script:target)",
      '$diag = Join-Path $env:TEMP "opencode-desktop-notify-popup.log"',
      "$ErrorActionPreference = 'Continue'",
      'Set-Content -Path $diag -Value "init fg=$([Focuser]::GetForegroundWindow()) target=$script:target atShow=$script:terminalAtShow"',
      "try {",
      "$script:lastFg = [Focuser]::GetForegroundWindow()",
      "$styleJson = $env:POPUP_STYLE",
      'if (-not $styleJson) { $styleJson = \'{"blinkColors":["#FFC800","#FF5050"],"blinkIntervalMs":600,"fontFamily":"Segoe UI","fontSize":12,"textColor":"#111111","opacity":1,"image":{"enabled":false,"position":"left"}}\' }',
      "$style = $styleJson | ConvertFrom-Json",
      "$title = $env:POPUP_TITLE",
      "$message = $env:POPUP_MESSAGE",
      "$form = New-Object NoActivateForm",
      "$form.Text = $title",
      "$form.TopMost = $true",
      '$form.FormBorderStyle = "FixedToolWindow"',
      "$form.AutoSize = $true",
      '$form.AutoSizeMode = "GrowAndShrink"',
      "$form.MaximizeBox = $false",
      "$form.MinimizeBox = $false",
      "$form.ShowInTaskbar = $false",
      '$form.StartPosition = "CenterScreen"',
      "$opacity = [double]$style.opacity",
      "if ($opacity -lt 0.2) { $opacity = 0.2 }",
      "if ($opacity -gt 1.0) { $opacity = 1.0 }",
      "$form.Opacity = $opacity",
      "$font = New-Object System.Drawing.Font($style.fontFamily, [double]$style.fontSize)",
      "$label = New-Object System.Windows.Forms.Label",
      '$label.Text = $title + "`n`n" + $message',
      "$label.Font = $font",
      "$label.ForeColor = [System.Drawing.ColorTranslator]::FromHtml($style.textColor)",
      "$label.AutoSize = $true",
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
      "$script:activated = $false",
      '$colors = @($style.blinkColors | ForEach-Object { [System.Drawing.ColorTranslator]::FromHtml($_) })',
      "if ($colors.Count -ge 2) {",
      "  $form.BackColor = $colors[0]",
      "  $timer = New-Object System.Windows.Forms.Timer",
      "  $timer.Interval = [int]$style.blinkIntervalMs",
      "  if ($timer.Interval -lt 100) { $timer.Interval = 100 }",
      "  $script:blink = $false",
      "  $timer.Add_Tick({",
      "    $script:blink = -not $script:blink",
      "    if ($script:blink) { $form.BackColor = $colors[0] } else { $form.BackColor = $colors[1] }",
      "  })",
      "  $timer.Start()",
      "} else {",
      "  $form.BackColor = $colors[0]",
      "}",
      "$activatePopup = { $script:activated = $true; Add-Content -Path $diag -Value \"click fg=$([Focuser]::GetForegroundWindow()) target=$script:target\"; Focus-Terminal; $form.Close() }",
      "$form.Add_Click($activatePopup)",
      "$label.Add_Click($activatePopup)",
      "if ($content) { $content.Add_Click($activatePopup) }",
      "if ($picture) { $picture.Add_Click($activatePopup) }",
      "$form.Add_FormClosed({ if ($picture -and $picture.Image) { $picture.Image.Dispose() } })",
      "if ($script:target -ne [IntPtr]::Zero) {",
      "  $focusTimer = New-Object System.Windows.Forms.Timer",
      "  $focusTimer.Interval = 150",
      "  $focusTimer.Add_Tick({",
      "    $dfg = [Focuser]::GetForegroundWindow()",
      "    if ($dfg -ne $script:lastFg) { $script:lastFg = $dfg; Add-Content -Path $diag -Value \"tick fg=$dfg target=$script:target atShow=$script:terminalAtShow\" }",
      "    if ($script:terminalAtShow) {",
      "      $fg = [Focuser]::GetForegroundWindow()",
      "      if ($fg -ne $script:target) { $script:terminalAtShow = $false }",
      "      return",
      "    }",
      "    $fg = [Focuser]::GetForegroundWindow()",
      "    if ($fg -eq $script:target) { Add-Content -Path $diag -Value \"auto-close fg=$fg\"; $form.Close() }",
      "  })",
      "  $focusTimer.Start()",
       "}",
       "[System.Windows.Forms.Application]::Run($form)",
       `if ($script:activated) { exit ${NativePersistentPopup.ACTIVATED_EXIT_CODE} }`,
       "} catch {",
      "  Add-Content -Path $diag -Value (\"ERROR: \" + $_.Exception.Message + \" | line=\" + $_.InvocationInfo.ScriptLineNumber)",
      "}",
    ].join("\n");
  }
}
