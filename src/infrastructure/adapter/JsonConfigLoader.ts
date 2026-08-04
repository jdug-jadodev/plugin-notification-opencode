import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { NotifyConfig } from "../../domain/entity/NotifyConfig.js";
import type { NotifierConfig } from "../../domain/port/out/NotifierConfig.js";
import { NotifyConfigMapper } from "./mapper/NotifyConfigMapper.js";
import { DEFAULT_NOTIFY_CONFIG } from "../config/defaultNotifyConfig.js";
import type { NotifyConfigFile } from "./entity/NotifyConfigFile.js";

const DEFAULT_PATH = join(homedir(), ".config", "opencode", "notify.json");

export class JsonConfigLoader implements NotifierConfig {
  private readonly path: string;
  private cached: NotifyConfig | undefined;

  constructor(path?: string) {
    this.path = path ?? process.env.OPENCODE_NOTIFY_CONFIG ?? DEFAULT_PATH;
  }

  async get(): Promise<NotifyConfig> {
    if (this.cached) return this.cached;
    this.cached = await this.load();
    return this.cached;
  }

  private async load(): Promise<NotifyConfig> {
    try {
      const raw = await readFile(this.path, "utf8");
      const source = JSON.parse(raw) as NotifyConfigFile;
      return NotifyConfigMapper.toDomain(source);
    } catch {
      return DEFAULT_NOTIFY_CONFIG;
    }
  }
}
