import { join } from "node:path";
import { type Client, type ClientEvents } from "discord.js";
import { glob } from "glob";
import { type Event, type EventListener } from "../event";

export async function loadDiscordEvents(dirPath: string, client: Client) {
	const globPattern = join(dirPath, "**/*.ts");
	const filePaths = await glob(globPattern);
	if (!filePaths.length) return;

	for (const filePath of filePaths) {
		const {
			default: { name, once, listener },
		} = (await import(filePath)) as { default: Event };

		const eventListener = createEventListener(name, client, listener);
		if (once) client.once(name, eventListener);
		else client.on(name, eventListener);
	}

	console.log(`Loaded ${filePaths.length} events`);
}

function createEventListener<T extends keyof ClientEvents>(
	name: string,
	client: Client,
	listener: EventListener<T>
) {
	return async (...args: ClientEvents[T]) => {
		try {
			await listener({ client, args });
		} catch (error) {
			console.error(`Error caught for event ${name}:`, error);
		}
	};
}
