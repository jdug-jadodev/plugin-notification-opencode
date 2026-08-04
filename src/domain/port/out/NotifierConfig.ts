import type { NotifyConfig } from "../../entity/NotifyConfig.js";

export interface NotifierConfig {
  get(): Promise<NotifyConfig>;
}
