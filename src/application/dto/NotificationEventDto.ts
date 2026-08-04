import type { EventType } from "../../domain/enum/EventType.js";

export type NotificationEventDto = {
  type: EventType;
  sessionId?: string;
  details?: string;
};
