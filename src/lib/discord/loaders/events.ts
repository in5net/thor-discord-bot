import logger from "$lib/logger";
import { type Event, type EventListener } from "../event";
import { noTestGlob } from "./shared";
import { pluralize } from "@in5net/std/string";
import { type Client, type ClientEvents } from "discord.js";
import path from "node:path";

export async function loadDiscordEvents(dirPath: string, client: Client) {
  dirPath = dirPath.replaceAll("\\", "/");
  const globPattern = path.join(dirPath, "**/*.ts");

  let count = 0;
  for await (const filePath of noTestGlob(globPattern)) {
    const {
      default: { name, once, listener },
    } = (await import(filePath)) as { default: Event };

    const eventListener = createEventListener(name, client, listener);
    if (once) {
      client.once(name, eventListener);
    } else {
      client.on(name, eventListener);
    }
    count++;
  }

  logger.info(`Loaded ${count} ${pluralize("event", count)}`);
}

function createEventListener<T extends keyof ClientEvents>(
  name: string,
  client: Client,
  listener: EventListener<T>,
) {
  return async (...args: ClientEvents[T]) => {
    try {
      await listener({ client, args });
    } catch (error) {
      console.error(`Error caught for event ${name}:`, error);
    }
  };
}
