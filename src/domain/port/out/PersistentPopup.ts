import type { NotificationMessage } from "../../entity/NotificationMessage.js";

export interface PersistentPopup {
  show(message: NotificationMessage): Promise<void>;
}
