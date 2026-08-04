import type { NotificationMessage } from "../../entity/NotificationMessage.js";

export interface NotificationSender {
  send(message: NotificationMessage): Promise<void>;
}
