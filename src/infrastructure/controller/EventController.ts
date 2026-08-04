import type { Event } from "@opencode-ai/sdk/v2";
import { NotificationEventMapper } from "../../application/mapper/NotificationEventMapper.js";
import { EventType } from "../../domain/enum/EventType.js";
import type { NotificationHandler } from "../../domain/port/in/NotificationHandler.js";
import { OpenCodeEventMapper } from "../adapter/mapper/OpenCodeEventMapper.js";

export class EventController {
  constructor(private readonly handler: NotificationHandler) {}

  async onSdkEvent(event: Event): Promise<void> {
    const dto = OpenCodeEventMapper.toDto(event);
    if (dto) await this.handler.handle(NotificationEventMapper.toDomain(dto));
  }

  async onToolExecuteBefore(tool: string, sessionId: string): Promise<void> {
    if (tool !== "question") return;
    await this.handler.handle(NotificationEventMapper.toDomain({ type: EventType.Question, sessionId }));
  }
}
