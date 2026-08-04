import { spawn, type ChildProcess } from "node:child_process";
import type { NotificationMessage } from "../../domain/entity/NotificationMessage.js";
import type { PopupStyle } from "../../domain/entity/PopupStyle.js";
import type { NotifierConfig } from "../../domain/port/out/NotifierConfig.js";
import type { PersistentPopup } from "../../domain/port/out/PersistentPopup.js";
import { LINUX_POPUP_PY, LINUX_POPUP_SH } from "../../helpers/linux/popup.js";
import { FIND_TERMINAL_PS, FOCUSER_CS, FOCUS_TERMINAL_PS, NOACTIVATE_FORM_CS } from "../../helpers/win32/terminal.js";
import { DEFAULT_POPUP_CONFIG } from "../config/defaultNotifyConfig.js";

export class NativePersistentPopup implements PersistentPopup {
  private active: ChildProcess | undefined;

  constructor(
    private readonly config?: NotifierConfig,
    private readonly platform: NodeJS.Platform = process.platform,
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
    child.once("exit", () => this.clear(child));
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

  private clear(child: ChildProcess): void {
    if (this.active === child) this.active = undefined;
  }

  private async env(message: NotificationMessage): Promise<NodeJS.ProcessEnv> {
    return {
      ...process.env,
      POPUP_TITLE: message.title,
      POPUP_MESSAGE: message.message,
      POPUP_STYLE: JSON.stringify(await this.style(message)),
      POPUP_LINUX_SCRIPT: LINUX_POPUP_PY,
    };
  }

  private async style(message: NotificationMessage): Promise<PopupStyle> {
    const popup = this.config ? (await this.config.get()).popup : DEFAULT_POPUP_CONFIG;
    const { events, ...globalStyle } = popup;
    return { ...globalStyle, ...events[message.kind] };
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
      'if (-not $styleJson) { $styleJson = \'{"blinkColors":["#FFC800","#FF5050"],"blinkIntervalMs":600,"fontFamily":"Segoe UI","fontSize":12,"textColor":"#111111","opacity":1}\' }',
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
      "$label.Padding = New-Object System.Windows.Forms.Padding(20)",
      "$label.AutoSize = $true",
      "$form.Controls.Add($label)",
      '$colors = @($style.blinkColors | ForEach-Object { [System.Drawing.ColorTranslator]::FromHtml($_) })',
      "if ($colors.Count -ge 2) {",
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
      "$form.Add_Click({ Add-Content -Path $diag -Value \"click fg=$([Focuser]::GetForegroundWindow()) target=$script:target\"; Focus-Terminal; Add-Content -Path $diag -Value \"after-focus fg=$([Focuser]::GetForegroundWindow())\"; $form.Close() })",
      "$label.Add_Click({ Add-Content -Path $diag -Value \"click-label fg=$([Focuser]::GetForegroundWindow()) target=$script:target\"; Focus-Terminal; $form.Close() })",
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
"} catch {",
      "  Add-Content -Path $diag -Value (\"ERROR: \" + $_.Exception.Message + \" | line=\" + $_.InvocationInfo.ScriptLineNumber)",
      "}",
    ].join("\n");
  }
}
