import notifier from "node-notifier";
import type { NotificationMessage } from "../../domain/entity/NotificationMessage.js";
import type { NotifierConfig } from "../../domain/port/out/NotifierConfig.js";
import type { NotificationSender } from "../../domain/port/out/NotificationSender.js";
import type { NodeNotifierOptions } from "./entity/NodeNotifierOptions.js";
import { NodeNotifierMapper } from "./mapper/NodeNotifierMapper.js";

export class NodeNotifierSender implements NotificationSender {
  private readonly clickHandler: (() => void) | undefined;

  constructor(private readonly config: NotifierConfig, onActivate?: () => void) {
    if (onActivate) {
      this.clickHandler = onActivate;
      const emitter = notifier as unknown as NodeJS.EventEmitter;
      emitter.on("click", () => this.clickHandler?.());
      emitter.on("activate", () => this.clickHandler?.());
    }
  }

  async send(message: NotificationMessage): Promise<void> {
    const settings = await this.config.get();
    await this.notify(NodeNotifierMapper.toInfrastructure(message, settings));
  }

  private notify(options: NodeNotifierOptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      notifier.notify(options as unknown as Parameters<typeof notifier.notify>[0], (error) =>
        error ? reject(error) : resolve(),
      );
    });
  }
}
