import type { EventType } from "../enum/EventType.js";

export type SoundRequest = {
  kind: EventType;
  path?: string;
};
