import notifier from "node-notifier";
import type { NotificationMessage } from "../../domain/entity/NotificationMessage.js";
import type { NotifierConfig } from "../../domain/port/out/NotifierConfig.js";
import type { NotificationSender } from "../../domain/port/out/NotificationSender.js";
import type { TerminalFocusWatcher } from "../../domain/port/out/TerminalFocusWatcher.js";
import type { NodeNotifierDismissOptions } from "./entity/NodeNotifierDismissOptions.js";
import type { NodeNotifierOptions } from "./entity/NodeNotifierOptions.js";
import { NodeNotifierMapper } from "./mapper/NodeNotifierMapper.js";

export class NodeNotifierSender implements NotificationSender {
  private readonly clickHandler: (() => void) | undefined;
  private activeId: number | undefined;
  private nextId = (process.pid * 1000) % 2_000_000_000;

  constructor(
    private readonly config: NotifierConfig,
    private readonly focusWatcher: TerminalFocusWatcher,
    onActivate?: () => void,
    private readonly platform: NodeJS.Platform = process.platform,
  ) {
    if (onActivate) {
      this.clickHandler = onActivate;
      const emitter = notifier as unknown as NodeJS.EventEmitter;
      emitter.on("click", () => this.clickHandler?.());
      emitter.on("activate", () => this.clickHandler?.());
    }
  }

  async send(message: NotificationMessage): Promise<void> {
    await this.dismiss();
    const settings = await this.config.get();
    const id = this.platform === "win32" ? this.nextId++ : undefined;
    this.activeId = id;
    if (id !== undefined) this.focusWatcher.start(() => void this.dismiss(id));
    try {
      await this.notify(NodeNotifierMapper.toInfrastructure(message, settings, this.platform, id));
    } finally {
      if (id !== undefined && this.activeId === id) {
        this.activeId = undefined;
        this.focusWatcher.stop();
      }
    }
  }

  async dismiss(expectedId?: number): Promise<void> {
    const id = this.activeId;
    if (id === undefined || (expectedId !== undefined && expectedId !== id)) return;
    this.activeId = undefined;
    this.focusWatcher.stop();
    await this.notify({ close: id });
  }

  private notify(options: NodeNotifierOptions | NodeNotifierDismissOptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      notifier.notify(options as unknown as Parameters<typeof notifier.notify>[0], (error) =>
        error ? reject(error) : resolve(),
      );
    });
  }
}
