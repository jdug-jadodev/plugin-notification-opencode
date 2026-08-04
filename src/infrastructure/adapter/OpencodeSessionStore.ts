import type { PluginInput } from "@opencode-ai/plugin";
import type { SessionInfo } from "../../domain/entity/SessionInfo.js";
import type { SessionStore } from "../../domain/port/out/SessionStore.js";
import { OpenCodeSessionMapper } from "./mapper/OpenCodeSessionMapper.js";

export class OpencodeSessionStore implements SessionStore {
  private readonly cache = new Map<string, SessionInfo>();

  constructor(private readonly client: PluginInput["client"]) {}

  async remember(info: SessionInfo): Promise<void> {
    this.cache.set(info.id, info);
  }

  async get(sessionId: string): Promise<SessionInfo | undefined> {
    const cached = this.cache.get(sessionId);
    if (cached) return cached;
    const result = await this.client.session.get({ path: { id: sessionId } });
    const session = result.data;
    if (!session) return undefined;
    const info = OpenCodeSessionMapper.toDomain(session);
    this.cache.set(sessionId, info);
    return info;
  }
}
