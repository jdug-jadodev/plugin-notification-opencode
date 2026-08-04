import { EventType } from "../enum/EventType.js";

export type NotificationEvent =
  | { type: EventType.Complete; sessionId?: string }
  | { type: EventType.Error; sessionId?: string; error?: string }
  | { type: EventType.Permission; sessionId?: string; permission: string }
  | { type: EventType.Question; sessionId?: string };
