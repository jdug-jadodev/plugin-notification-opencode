import type { NotificationEvent } from "../../domain/entity/NotificationEvent.js";
import type { NotificationMessage } from "../../domain/entity/NotificationMessage.js";
import type { NotifyConfig } from "../../domain/entity/NotifyConfig.js";
import { EventType } from "../../domain/enum/EventType.js";
import type { NotificationHandler } from "../../domain/port/in/NotificationHandler.js";
import type { Logger } from "../../domain/port/out/Logger.js";
import type { NotifierConfig } from "../../domain/port/out/NotifierConfig.js";
import type { NotificationSender } from "../../domain/port/out/NotificationSender.js";
import type { PersistentPopup } from "../../domain/port/out/PersistentPopup.js";
import type { SessionStore } from "../../domain/port/out/SessionStore.js";
import type { SoundPlayer } from "../../domain/port/out/SoundPlayer.js";
import type { TitleFlasher } from "../../domain/port/out/TitleFlasher.js";
import { QuietHours } from "../validation/QuietHours.js";
import { SpamGuard } from "../validation/SpamGuard.js";

export class NotifyOnEventUseCase implements NotificationHandler {
  private readonly spamGuard = new SpamGuard(0);
  private configured = false;

  constructor(
    private readonly sender: NotificationSender,
    private readonly soundPlayer: SoundPlayer,
    private readonly popup: PersistentPopup,
    private readonly titleFlasher: TitleFlasher,
    private readonly sessions: SessionStore,
    private readonly config: NotifierConfig,
    private readonly logger: Logger,
  ) {}

  async handle(event: NotificationEvent): Promise<void> {
    const settings = await this.config.get();

    if (!this.configured) {
      this.spamGuard.setCooldown(settings.cooldownMs);
      this.configured = true;
    }

    const quietHours = new QuietHours(settings.quietHours);
    if (quietHours.isQuiet()) return;

    let sessionTitle: string | undefined;
    if (event.sessionId) {
      const session = await this.sessions.get(event.sessionId);
      if (session) {
        sessionTitle = session.title;
        if (settings.onlyMainSessions && session.parentId) return;
      }
    }

    if (!this.spamGuard.allow(event.type)) return;

    const channel = settings.events[event.type];
    if (!channel) return;

    const message = this.buildMessage(event, settings, sessionTitle);
    const deliveries: Promise<unknown>[] = [];

    if (channel.system) deliveries.push(this.sender.send(message));
    if (channel.sound) {
      deliveries.push(this.soundPlayer.play({ kind: event.type, path: settings.sounds[event.type] }));
    }
    if (channel.popup) deliveries.push(this.popup.show(message));
    if (channel.titleFlash && settings.titleFlash.text) {
      deliveries.push(this.titleFlasher.flash(settings.titleFlash.text));
    }

    const results = await Promise.allSettled(deliveries);
    for (const result of results) {
      if (result.status === "rejected") this.logger.warn(`notification delivery failed: ${String(result.reason)}`);
    }

    this.logger.info(`notified ${event.type}`);
  }

  private buildMessage(event: NotificationEvent, settings: NotifyConfig, sessionTitle?: string): NotificationMessage {
    const template = settings.messages[event.type];
    const session = sessionTitle ?? event.sessionId ?? "";
    return {
      kind: event.type,
      title: this.fill(template.title, session, ""),
      message: this.fill(template.message, session, this.details(event)),
      icon: template.icon,
    };
  }

  private details(event: NotificationEvent): string {
    switch (event.type) {
      case EventType.Error:
        return event.error ?? "";
      case EventType.Permission:
        return event.permission;
      default:
        return "";
    }
  }

  private fill(template: string, session: string, details: string): string {
    return template.replaceAll("{session}", session).replaceAll("{details}", details);
  }
}
