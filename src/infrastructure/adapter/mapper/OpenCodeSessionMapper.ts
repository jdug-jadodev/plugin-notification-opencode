import type { SessionInfo } from "../../../domain/entity/SessionInfo.js";
import type { OpenCodeSession } from "../entity/OpenCodeSession.js";

export class OpenCodeSessionMapper {
  static toDomain(session: OpenCodeSession): SessionInfo {
    return { id: session.id, parentId: session.parentID, title: session.title };
  }
}
