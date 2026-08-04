import type { NotificationEvent } from "../../entity/NotificationEvent.js";

export interface NotificationHandler {
  handle(event: NotificationEvent): Promise<void>;
}
