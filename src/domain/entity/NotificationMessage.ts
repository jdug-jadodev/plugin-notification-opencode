import type { EventType } from "../enum/EventType.js";

export type NotificationMessage = {
  kind: EventType;
  title: string;
  message: string;
  icon?: string;
};
