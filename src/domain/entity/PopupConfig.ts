import type { PopupStyle } from "./PopupStyle.js";
import type { EventType } from "../enum/EventType.js";

export type PopupConfig = PopupStyle & {
  events: Partial<Record<EventType, Partial<PopupStyle>>>;
};
