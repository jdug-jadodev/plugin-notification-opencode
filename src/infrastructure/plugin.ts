import type { Plugin } from "@opencode-ai/plugin";
import { NotifyOnEventUseCase } from "../application/usecase/NotifyOnEventUseCase.js";
import { AnsiTitleFlasher } from "./adapter/AnsiTitleFlasher.js";
import { BunLogger } from "./adapter/BunLogger.js";
import { JsonConfigLoader } from "./adapter/JsonConfigLoader.js";
import { NativePersistentPopup } from "./adapter/NativePersistentPopup.js";
import { NativeSoundPlayer } from "./adapter/NativeSoundPlayer.js";
import { NativeTerminalFocuser } from "./adapter/NativeTerminalFocuser.js";
import { NodeNotifierSender } from "./adapter/NodeNotifierSender.js";
import { OpencodeSessionStore } from "./adapter/OpencodeSessionStore.js";
import type { OpenCodeNotifyOptions } from "./config/OpenCodeNotifyOptions.js";
import { EventController } from "./controller/EventController.js";

export type { OpenCodeNotifyOptions } from "./config/OpenCodeNotifyOptions.js";

const opencodeNotify: Plugin = async ({ client }, options) => {
  const settings = (options ?? {}) as OpenCodeNotifyOptions;
  const config = new JsonConfigLoader(settings.configPath);
  const sessions = new OpencodeSessionStore(client);
  const logger = new BunLogger(client);
  const terminalFocuser = new NativeTerminalFocuser();
  const sender = new NodeNotifierSender(config, () => {
    void terminalFocuser.focus();
  });
  const soundPlayer = new NativeSoundPlayer();
  const popup = new NativePersistentPopup(config);
  const titleFlasher = new AnsiTitleFlasher(config);
  const handler = new NotifyOnEventUseCase(sender, soundPlayer, popup, titleFlasher, sessions, config, logger);
  const controller = new EventController(handler);

  logger.info("initialized");

  return {
    event: async ({ event }) => {
      if (event.type === "session.created") {
        const info = event.properties.info;
        await sessions.remember({ id: info.id, parentId: info.parentID, title: info.title });
        return;
      }
      await controller.onSdkEvent(event as unknown as Parameters<typeof controller.onSdkEvent>[0]);
    },
    "tool.execute.before": async ({ tool, sessionID }) => {
      await controller.onToolExecuteBefore(tool, sessionID);
    },
  };
};

export default opencodeNotify;
