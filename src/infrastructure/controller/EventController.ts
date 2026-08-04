import type { Event } from "@opencode-ai/sdk/v2";
import { NotificationEventMapper } from "../../application/mapper/NotificationEventMapper.js";
import { EventType } from "../../domain/enum/EventType.js";
import type { NotificationHandler } from "../../domain/port/in/NotificationHandler.js";
import { OpenCodeEventMapper } from "../adapter/mapper/OpenCodeEventMapper.js";

export class EventController {
  private readonly failedSessions = new Set<string>();

  constructor(private readonly handler: NotificationHandler) {}

  async onSdkEvent(event: Event): Promise<void> {
    if (event.type === "session.status" && event.properties.status.type === "busy") {
      this.failedSessions.delete(event.properties.sessionID);
      return;
    }
    if (event.type === "session.error" && event.properties.sessionID) {
      this.failedSessions.add(event.properties.sessionID);
    }
    if (event.type === "session.idle" && this.failedSessions.delete(event.properties.sessionID)) return;

    const dto = OpenCodeEventMapper.toDto(event);
    if (dto) await this.handler.handle(NotificationEventMapper.toDomain(dto));
  }

  async onToolExecuteBefore(tool: string, sessionId: string): Promise<void> {
    if (tool !== "question") return;
    await this.handler.handle(NotificationEventMapper.toDomain({ type: EventType.Question, sessionId }));
  }
}
