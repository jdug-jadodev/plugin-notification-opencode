import type { Event } from "@opencode-ai/sdk/v2";
import { NotificationEventMapper } from "../../application/mapper/NotificationEventMapper.js";
import { EventType } from "../../domain/enum/EventType.js";
import type { NotificationHandler } from "../../domain/port/in/NotificationHandler.js";
import { OpenCodeEventMapper } from "../adapter/mapper/OpenCodeEventMapper.js";

export class EventController {
  private readonly incompleteSessions = new Set<string>();
  private incompleteSessionWithoutId = false;
  private activeSessionId: string | undefined;

  constructor(private readonly handler: NotificationHandler) {}

  async onSdkEvent(event: Event): Promise<void> {
    if (event.type === "session.status" && event.properties.status.type === "busy") {
      this.activeSessionId = event.properties.sessionID;
    }
    if (event.type === "message.updated") {
      this.activeSessionId = event.properties.sessionID;
      const message = event.properties.info;
      if (message.role === "assistant" && message.summary !== true) {
        if (message.error) {
          this.incompleteSessions.add(event.properties.sessionID);
          this.incompleteSessionWithoutId = false;
        } else if (message.time.completed !== undefined) {
          this.incompleteSessions.delete(event.properties.sessionID);
          this.incompleteSessionWithoutId = false;
        }
      }
    }
    if (event.type === "session.error") {
      const sessionId = event.properties.sessionID ?? this.activeSessionId;
      if (sessionId) this.incompleteSessions.add(sessionId);
      else this.incompleteSessionWithoutId = true;
    }
    if (event.type === "session.error" && event.properties.error?.name === "MessageAbortedError") return;
    if (event.type === "session.idle") {
      if (this.incompleteSessions.has(event.properties.sessionID) || this.incompleteSessionWithoutId) return;
    }

    const dto = OpenCodeEventMapper.toDto(event);
    if (dto) await this.handler.handle(NotificationEventMapper.toDomain(dto));
  }

  async onToolExecuteBefore(tool: string, sessionId: string): Promise<void> {
    if (tool !== "question") return;
    await this.handler.handle(NotificationEventMapper.toDomain({ type: EventType.Question, sessionId }));
  }
}
