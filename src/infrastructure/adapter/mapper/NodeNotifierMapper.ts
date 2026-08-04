import type { NotificationMessage } from "../../../domain/entity/NotificationMessage.js";
import type { NotifyConfig } from "../../../domain/entity/NotifyConfig.js";
import type { NodeNotifierOptions } from "../entity/NodeNotifierOptions.js";

export class NodeNotifierMapper {
  static toInfrastructure(
    message: NotificationMessage,
    settings: NotifyConfig,
    platform: NodeJS.Platform,
    id?: number,
  ): NodeNotifierOptions {
    const options: NodeNotifierOptions = {
      title: message.title,
      message: message.message,
      icon: message.icon,
      appID: settings.toast.appID,
      silent: true,
    };
    if (platform === "win32") return { ...options, id, wait: true };
    return { ...options, appName: settings.toast.appName, timeout: 5, wait: false };
  }
}
