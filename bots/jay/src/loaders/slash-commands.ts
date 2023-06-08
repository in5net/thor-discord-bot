/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Collection } from "discord.js";
import { glob } from "glob";
import { type SlashCommand } from "$services/commands/slash";

export async function loadSlashCommands() {
	const dirPath = new URL("../commands/text", import.meta.url).pathname;
	const globPattern = new URL("**/*.ts", dirPath).pathname;
	const filePaths = await glob(globPattern);

	const commands = new Collection<string, SlashCommand>();

	for (const filePath of filePaths) {
		const commandModule = await import(filePath);
		const command: SlashCommand = commandModule.default;

		const subPath = filePath.replace(dirPath, "");
		const name = subPath.replaceAll("/", " ").replace(".ts", "");

		commands.set(name, command);
	}

	console.log(`Loaded ${commands.size} slash commands`);

	return commands;
}
