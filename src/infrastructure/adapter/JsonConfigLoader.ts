import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import type { NotifyConfig } from "../../domain/entity/NotifyConfig.js";
import type { PopupConfig } from "../../domain/entity/PopupConfig.js";
import { EventType } from "../../domain/enum/EventType.js";
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
      return this.resolveImagePaths(NotifyConfigMapper.toDomain(source));
    } catch {
      return DEFAULT_NOTIFY_CONFIG;
    }
  }

  private resolveImagePaths(config: NotifyConfig): NotifyConfig {
    const events = { ...config.popup.events };
    for (const type of Object.values(EventType)) {
      const style = events[type];
      if (style?.image) events[type] = { ...style, image: this.resolveImagePath(style.image) };
    }
    return {
      ...config,
      popup: {
        ...config.popup,
        image: this.resolveImagePath(config.popup.image),
        events: events as PopupConfig["events"],
      },
    };
  }

  private resolveImagePath<T extends { path?: string }>(image: T): T {
    if (!image.path || isAbsolute(image.path)) return image;
    return { ...image, path: resolve(dirname(resolve(this.path)), image.path) };
  }
}
