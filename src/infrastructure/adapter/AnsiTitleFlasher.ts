import { exec } from "node:child_process";
import type { NotifierConfig } from "../../domain/port/out/NotifierConfig.js";
import type { TitleFlasher } from "../../domain/port/out/TitleFlasher.js";

export class AnsiTitleFlasher implements TitleFlasher {
  private originalTitle: string | undefined;
  private flashTimer: ReturnType<typeof setInterval> | undefined;
  private restoreTimer: ReturnType<typeof setTimeout> | undefined;
  private flashOn = false;

  constructor(private readonly config: NotifierConfig) {}

  async flash(text: string): Promise<void> {
    const settings = await this.config.get();
    this.stop();
    if (this.originalTitle === undefined) this.originalTitle = await this.readTitle();
    this.flashOn = false;
    this.paint(text);
    this.flashTimer = setInterval(() => {
      this.flashOn = !this.flashOn;
      this.paint(this.flashOn ? text : (this.originalTitle ?? ""));
    }, settings.titleFlash.intervalMs);
    this.restoreTimer = setTimeout(() => this.stop(), settings.titleFlash.durationMs);
  }

  private stop(): void {
    if (this.flashTimer !== undefined) clearInterval(this.flashTimer);
    if (this.restoreTimer !== undefined) clearTimeout(this.restoreTimer);
    this.flashTimer = undefined;
    this.restoreTimer = undefined;
    if (this.originalTitle !== undefined) this.paint(this.originalTitle);
  }

  private paint(title: string): void {
    process.stdout.write(`\x1b]2;${title}\x07`);
  }

  private readTitle(): Promise<string> {
    if (process.platform !== "win32") return Promise.resolve("");
    return new Promise((resolve) => {
      exec(`powershell -NoProfile -Command "[console]::Title"`, (error, stdout) => {
        if (error) {
          resolve("");
          return;
        }
        resolve(stdout.trim());
      });
    });
  }
}
