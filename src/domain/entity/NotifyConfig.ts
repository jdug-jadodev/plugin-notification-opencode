import type { EventType } from "../enum/EventType.js";
import type { ChannelConfig } from "./ChannelConfig.js";
import type { NotificationTemplate } from "./NotificationTemplate.js";
import type { PopupConfig } from "./PopupConfig.js";
import type { QuietHoursConfig } from "./QuietHoursConfig.js";
import type { TitleFlashConfig } from "./TitleFlashConfig.js";
import type { ToastConfig } from "./ToastConfig.js";

export type NotifyConfig = {
  events: Record<EventType, ChannelConfig>;
  messages: Record<EventType, NotificationTemplate>;
  sounds: Partial<Record<EventType, string>>;
  cooldownMs: number;
  quietHours: QuietHoursConfig;
  onlyMainSessions: boolean;
  toast: ToastConfig;
  titleFlash: TitleFlashConfig;
  popup: PopupConfig;
};
