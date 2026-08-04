import { spawn } from "node:child_process";
import type { TerminalFocuser } from "../../domain/port/out/TerminalFocuser.js";
import { FIND_TERMINAL_PS, FOCUSER_CS, FOCUS_TERMINAL_PS } from "../../helpers/win32/terminal.js";

export class NativeTerminalFocuser implements TerminalFocuser {
  constructor(private readonly platform: NodeJS.Platform = process.platform) {}

  async focus(): Promise<void> {
    const command = this.command();
    if (!command) return;
    await new Promise<void>((resolve) => {
      const child = spawn(command[0], command.slice(1), {
        stdio: "ignore",
        detached: this.platform !== "win32",
        windowsHide: this.platform === "win32",
      });
      child.unref();
      child.once("error", () => resolve());
      child.once("exit", () => resolve());
    });
  }

  private command(): string[] | undefined {
    switch (this.platform) {
      case "win32":
        return ["powershell", "-NoProfile", "-NonInteractive", "-Command", this.windowsScript()];
      case "darwin":
        return ["osascript", "-e", "tell application \"System Events\" to set frontmost of (first process whose name is \"Terminal\") to true"];
      case "linux":
        return [
          "sh",
          "-c",
          "term=$(wmctrl -l | head -n1 | cut -d' ' -f1) && wmctrl -i -a \"$term\"",
        ];
      default:
        return undefined;
    }
  }

  private windowsScript(): string {
    return [
      "$code = @'",
      FOCUSER_CS,
      "'@",
      "Add-Type $code",
      FIND_TERMINAL_PS,
      FOCUS_TERMINAL_PS,
      "Focus-Terminal",
    ].join("\n");
  }
}
