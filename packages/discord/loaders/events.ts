import { pluralize } from "@in5net/std/string";
import { type Client, type ClientEvents } from "discord.js";
import logger from "logger";
import { join } from "node:path";
import { type Event, type EventListener } from "../event";
import { noTestGlob } from "./shared";

export async function loadDiscordEvents(dirPath: string, client: Client) {
	dirPath = dirPath.replaceAll("\\", "/");
	const globPattern = join(dirPath, "**/*.ts");
	const filePaths = await noTestGlob(globPattern);
	if (!filePaths.length) return;

	for (const filePath of filePaths) {
		const {
			default: { name, once, listener },
		} = (await import(filePath)) as { default: Event };

		const eventListener = createEventListener(name, client, listener);
		if (once) client.once(name, eventListener);
		else client.on(name, eventListener);
	}

	logger.info(
		`Loaded ${filePaths.length} ${pluralize("event", filePaths.length)}`,
	);
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
			logger.error(`Error caught for event ${name}:`, error);
		}
	};
}
