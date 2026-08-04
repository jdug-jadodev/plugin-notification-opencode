export class SpamGuard {
  private cooldownMs: number;
  private readonly lastFiredAt = new Map<string, number>();

  constructor(cooldownMs: number) {
    this.cooldownMs = cooldownMs;
  }

  setCooldown(cooldownMs: number): void {
    this.cooldownMs = cooldownMs;
  }

  allow(key: string, now: number = Date.now()): boolean {
    const last = this.lastFiredAt.get(key);
    if (last !== undefined && now - last < this.cooldownMs) return false;
    this.lastFiredAt.set(key, now);
    return true;
  }
}
