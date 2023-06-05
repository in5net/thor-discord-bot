import { basename } from "node:path";
import { Collection } from "discord.js";
import { glob } from "glob";
import { type TextCommand } from "$services/commands/text";

export async function loadTextCommands() {
	const dirPath = new URL(
		"../commands/text/*.ts",
		import.meta.url
	).pathname.replaceAll("\\", "/");
	const filePaths = await glob(dirPath);

	const commands = new Collection<string, TextCommand>();

	for (const filePath of filePaths) {
		const commandModule = await import(filePath);
		const command: TextCommand = commandModule.default;

		const commandName = basename(filePath, ".ts");

		commands.set(commandName, command);
	}

	console.log(`Loaded ${commands.size} text commands`);

	return commands;
}
