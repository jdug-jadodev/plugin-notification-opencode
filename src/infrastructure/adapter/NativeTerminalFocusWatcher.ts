import { spawn, type ChildProcess } from "node:child_process";
import type { TerminalFocusWatcher } from "../../domain/port/out/TerminalFocusWatcher.js";
import { FIND_TERMINAL_PS, FOCUSER_CS, WAIT_FOR_TERMINAL_FOCUS_PS } from "../../helpers/win32/terminal.js";

export class NativeTerminalFocusWatcher implements TerminalFocusWatcher {
  private child: ChildProcess | undefined;

  constructor(private readonly platform: NodeJS.Platform = process.platform) {}

  start(onFocus: () => void): void {
    this.stop();
    const command = this.command();
    if (!command) return;
    const child = spawn(command[0], command.slice(1), { stdio: "ignore", windowsHide: this.platform === "win32" });
    this.child = child;
    child.once("error", () => this.clear(child));
    child.once("exit", (code) => {
      if (!this.clear(child)) return;
      if (code === 0) onFocus();
    });
  }

  stop(): void {
    if (!this.child) return;
    const child = this.child;
    this.child = undefined;
    try {
      child.kill();
    } catch {
      /* ignore */
    }
  }

  private clear(child: ChildProcess): boolean {
    if (this.child !== child) return false;
    this.child = undefined;
    return true;
  }

  private command(): string[] | undefined {
    if (this.platform !== "win32") return undefined;
    return ["powershell", "-NoProfile", "-NonInteractive", "-Command", this.windowsScript()];
  }

  private windowsScript(): string {
    return ["$code = @'", FOCUSER_CS, "'@", "Add-Type $code", FIND_TERMINAL_PS, WAIT_FOR_TERMINAL_FOCUS_PS].join("\n");
  }
}
