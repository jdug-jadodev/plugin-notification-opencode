import type { SoundRequest } from "../../entity/SoundRequest.js";

export interface SoundPlayer {
  play(sound: SoundRequest): Promise<void>;
}
