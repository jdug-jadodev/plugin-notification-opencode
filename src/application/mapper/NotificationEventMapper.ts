import type { NotificationEvent } from "../../domain/entity/NotificationEvent.js";
import { EventType } from "../../domain/enum/EventType.js";
import type { NotificationEventDto } from "../dto/NotificationEventDto.js";

export class NotificationEventMapper {
  static toDomain(dto: NotificationEventDto): NotificationEvent {
    switch (dto.type) {
      case EventType.Error:
        return { type: dto.type, sessionId: dto.sessionId, error: dto.details };
      case EventType.Permission:
        return { type: dto.type, sessionId: dto.sessionId, permission: dto.details ?? "" };
      case EventType.Complete:
      case EventType.Question:
        return { type: dto.type, sessionId: dto.sessionId };
    }
  }
}
