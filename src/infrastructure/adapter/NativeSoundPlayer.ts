import { spawn } from "node:child_process";
import type { SoundRequest } from "../../domain/entity/SoundRequest.js";
import type { SoundPlayer } from "../../domain/port/out/SoundPlayer.js";
import { LINUX_DEFAULT_SOUND_SH, LINUX_FILE_SOUND_SH } from "../../helpers/linux/sound.js";

export class NativeSoundPlayer implements SoundPlayer {
  constructor(private readonly platform: NodeJS.Platform = process.platform) {}

  async play(sound: SoundRequest): Promise<void> {
    const command = this.command(sound);
    if (!command) return;
    await new Promise<void>((resolve, reject) => {
      const child = spawn(command[0], command.slice(1), {
        stdio: "ignore",
        detached: true,
        windowsHide: this.platform === "win32",
      });
      child.unref();
      child.once("error", reject);
      child.once("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`sound player exited with code ${String(code)}`));
      });
    });
  }

  private command(sound: SoundRequest): string[] | undefined {
    if (sound.path) return this.playFile(sound.path);
    switch (this.platform) {
      case "win32":
        return ["powershell", "-NoProfile", "-NonInteractive", "-Command", "[console]::beep(1000, 300)"];
      case "darwin":
        return ["afplay", "/System/Library/Sounds/Glass.aiff"];
      case "linux":
        return ["sh", "-c", LINUX_DEFAULT_SOUND_SH, "opencode-sound", this.linuxSoundName(sound)];
      default:
        return undefined;
    }
  }

  private playFile(path: string): string[] {
    if (this.platform === "win32") {
      return ["powershell", "-NoProfile", "-NonInteractive", "-Command", `(New-Object Media.SoundPlayer '${path}').PlaySync()`];
    }
    if (this.platform === "linux") return ["sh", "-c", LINUX_FILE_SOUND_SH, "opencode-sound", path];
    return ["afplay", path];
  }

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
}
