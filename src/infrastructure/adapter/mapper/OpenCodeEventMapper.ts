import type { Event } from "@opencode-ai/sdk/v2";
import type { NotificationEventDto } from "../../../application/dto/NotificationEventDto.js";
import { EventType } from "../../../domain/enum/EventType.js";

export class OpenCodeEventMapper {
  static toDto(event: Event): NotificationEventDto | undefined {
    switch (event.type) {
      case "session.idle":
        return { type: EventType.Complete, sessionId: event.properties.sessionID };
      case "session.error":
        return {
          type: EventType.Error,
          sessionId: event.properties.sessionID,
          details: this.describeError(event.properties.error),
        };
      case "permission.asked":
        return {
          type: EventType.Permission,
          sessionId: event.properties.sessionID,
          details: event.properties.permission,
        };
      default:
        return undefined;
    }
  }

  private static describeError(error: unknown): string | undefined {
    if (typeof error === "string") return error;
    if (!error || typeof error !== "object") return undefined;
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
    const data = (error as { data?: { message?: unknown } }).data;
    if (data && typeof data.message === "string") return data.message;
    return undefined;
  }
}
