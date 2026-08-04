import type { SessionInfo } from "../../entity/SessionInfo.js";

export interface SessionStore {
  get(sessionId: string): Promise<SessionInfo | undefined>;
  remember(info: SessionInfo): Promise<void>;
}
