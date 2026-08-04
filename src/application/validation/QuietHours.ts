import type { QuietHoursConfig } from "../../domain/entity/QuietHoursConfig.js";

export class QuietHours {
  constructor(private readonly config: QuietHoursConfig) {}

  isQuiet(now: Date = new Date()): boolean {
    if (!this.config.enabled) return false;
    const start = this.toMinutes(this.config.start);
    const end = this.toMinutes(this.config.end);
    if (start === end) return false;
    const current = now.getHours() * 60 + now.getMinutes();
    if (start < end) return current >= start && current < end;
    return current >= start || current < end;
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
    return hours * 60 + (Number.isNaN(minutes) ? 0 : minutes);
  }
}
