import type { EventType } from "../enum/EventType.js";
import type { PopupStyle, PopupStyleOverride } from "./PopupStyle.js";

export type PopupConfig = PopupStyle & {
  events: Partial<Record<EventType, PopupStyleOverride>>;
};
