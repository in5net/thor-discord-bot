/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { parse } from "node:path";
import { Collection } from "discord.js";
import { glob } from "glob";
import { type TextCommand } from "$services/commands/text";

type Command = TextCommand & { category?: string };

export async function loadTextCommands() {
	const dirPath = new URL("../commands/text", import.meta.url).pathname;
	const globPattern = new URL("**/*.ts", dirPath).pathname;
	const filePaths = await glob(globPattern);

	const commands = new Collection<string, Command>();

	for (const filePath of filePaths) {
		const commandModule = await import(filePath);
		const command: Command = commandModule.default;

		const subPath = filePath.replace(dirPath, "");
		const { dir: category, name } = parse(subPath);

		commands.set(name, command);
		if (category) command.category = category;
	}

	console.log(`Loaded ${commands.size} text commands`);

	return commands;
}
