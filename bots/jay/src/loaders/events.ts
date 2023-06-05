import type { Client, ClientEvents } from "discord.js";
import { glob } from "glob";
import type { Event } from "$services/event";

export async function loadDiscordEvents(client: Client) {
	const dirPath = new URL(
		"../events/*.ts",
		import.meta.url
	).pathname.replaceAll("\\", "/");

	const filePaths = await glob(dirPath);
	if (!filePaths.length) return;

	for (const filePath of filePaths) {
		const { default: event } = await import(filePath);
		const { name, once, listener }: Event = event;

		// eslint-disable-next-line no-inner-declarations
		async function eventListener<T extends keyof ClientEvents>(
			...arguments_: ClientEvents[T]
		) {
			try {
				await listener({ client, args: arguments_ });
			} catch (error) {
				console.error(`Error caught for event ${name}:`, error);
			}
		}

		if (once) client.once(name, eventListener);
		else client.on(name, eventListener);
	}

	console.log(`Loaded ${filePaths.length} events`);
}
