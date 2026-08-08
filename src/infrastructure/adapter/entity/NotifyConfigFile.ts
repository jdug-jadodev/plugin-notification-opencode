import type { ChannelConfig } from "../../../domain/entity/ChannelConfig.js";
import type { NotificationTemplate } from "../../../domain/entity/NotificationTemplate.js";
import type { PopupStyleOverride } from "../../../domain/entity/PopupStyle.js";
import type { QuietHoursConfig } from "../../../domain/entity/QuietHoursConfig.js";
import type { TitleFlashConfig } from "../../../domain/entity/TitleFlashConfig.js";
import type { ToastConfig } from "../../../domain/entity/ToastConfig.js";
import type { EventType } from "../../../domain/enum/EventType.js";

type PopupConfigFile = PopupStyleOverride & {
  events?: Partial<Record<EventType, PopupStyleOverride>>;
};

export type NotifyConfigFile = {
  events?: Partial<Record<EventType, Partial<ChannelConfig>>>;
  messages?: Partial<Record<EventType, Partial<NotificationTemplate>>>;
  sounds?: Partial<Record<EventType, string>>;
  cooldownMs?: number;
  quietHours?: Partial<QuietHoursConfig>;
  onlyMainSessions?: boolean;
  toast?: Partial<ToastConfig>;
  titleFlash?: Partial<TitleFlashConfig>;
  popup?: PopupConfigFile;
};
