import type { PluginInput } from "@opencode-ai/plugin";
import type { Logger } from "../../domain/port/out/Logger.js";

export class BunLogger implements Logger {
  constructor(private readonly client: PluginInput["client"]) {}

  debug(message: string): void {
    this.log("debug", message);
  }

  info(message: string): void {
    this.log("info", message);
  }

  warn(message: string): void {
    this.log("warn", message);
  }

  error(message: string): void {
    this.log("error", message);
  }

  private log(level: "debug" | "info" | "warn" | "error", message: string): void {
    this.client.app.log({ body: { service: "opencode-desktop-notify", level, message } }).catch(() => {});
  }
}
