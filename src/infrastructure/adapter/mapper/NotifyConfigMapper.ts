import type { NotifyConfig } from "../../../domain/entity/NotifyConfig.js";
import { EventType } from "../../../domain/enum/EventType.js";
import { DEFAULT_NOTIFY_CONFIG } from "../../config/defaultNotifyConfig.js";
import type { NotifyConfigFile } from "../entity/NotifyConfigFile.js";

export class NotifyConfigMapper {
  static toDomain(source: NotifyConfigFile): NotifyConfig {
    const channel = (type: EventType) => ({
      ...DEFAULT_NOTIFY_CONFIG.events[type],
      ...source.events?.[type],
    });
    const message = (type: EventType) => ({
      ...DEFAULT_NOTIFY_CONFIG.messages[type],
      ...source.messages?.[type],
    });
    return {
      cooldownMs: source.cooldownMs ?? DEFAULT_NOTIFY_CONFIG.cooldownMs,
      onlyMainSessions: source.onlyMainSessions ?? DEFAULT_NOTIFY_CONFIG.onlyMainSessions,
      quietHours: { ...DEFAULT_NOTIFY_CONFIG.quietHours, ...source.quietHours },
      toast: { ...DEFAULT_NOTIFY_CONFIG.toast, ...source.toast },
      titleFlash: { ...DEFAULT_NOTIFY_CONFIG.titleFlash, ...source.titleFlash },
      popup: { ...DEFAULT_NOTIFY_CONFIG.popup, ...source.popup },
      sounds: { ...DEFAULT_NOTIFY_CONFIG.sounds, ...source.sounds },
      events: {
        [EventType.Complete]: channel(EventType.Complete),
        [EventType.Error]: channel(EventType.Error),
        [EventType.Permission]: channel(EventType.Permission),
        [EventType.Question]: channel(EventType.Question),
      },
      messages: {
        [EventType.Complete]: message(EventType.Complete),
        [EventType.Error]: message(EventType.Error),
        [EventType.Permission]: message(EventType.Permission),
        [EventType.Question]: message(EventType.Question),
      },
    };
  }
}
