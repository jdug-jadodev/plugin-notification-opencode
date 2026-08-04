import type { NotificationMessage } from "../../../domain/entity/NotificationMessage.js";
import type { NotifyConfig } from "../../../domain/entity/NotifyConfig.js";
import type { NodeNotifierOptions } from "../entity/NodeNotifierOptions.js";

export class NodeNotifierMapper {
  static toInfrastructure(message: NotificationMessage, settings: NotifyConfig): NodeNotifierOptions {
    return {
      title: message.title,
      message: message.message,
      icon: message.icon,
      appID: settings.toast.appID,
      appName: settings.toast.appName,
      timeout: 10,
      wait: true,
    };
  }
}
