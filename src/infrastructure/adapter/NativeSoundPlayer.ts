import { spawn } from "node:child_process";
import type { SoundRequest } from "../../domain/entity/SoundRequest.js";
import type { SoundPlayer } from "../../domain/port/out/SoundPlayer.js";

export class NativeSoundPlayer implements SoundPlayer {
  constructor(private readonly platform: NodeJS.Platform = process.platform) {}

  async play(sound: SoundRequest): Promise<void> {
    const command = this.command(sound);
    if (!command) return;
    await new Promise<void>((resolve) => {
      const child = spawn(command[0], command.slice(1), { stdio: "ignore", detached: true });
      child.unref();
      child.once("error", () => resolve());
      child.once("exit", () => resolve());
    });
  }

  private command(sound: SoundRequest): string[] | undefined {
    if (sound.path) return this.playFile(sound.path);
    switch (this.platform) {
      case "win32":
        return ["powershell", "-NoProfile", "-Command", "[console]::beep(1000, 300)"];
      case "darwin":
        return ["afplay", "/System/Library/Sounds/Glass.aiff"];
      case "linux":
        return ["paplay", "/usr/share/sounds/freedesktop/stereo/complete.oga"];
      default:
        return undefined;
    }
  }

  private playFile(path: string): string[] {
    if (this.platform === "win32") {
      return ["powershell", "-NoProfile", "-Command", `(New-Object Media.SoundPlayer '${path}').PlaySync()`];
    }
    return ["afplay", path];
  }
}
