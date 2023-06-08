import { join, parse } from "node:path";
import { Collection } from "discord.js";
import { glob } from "glob";
import { type TextCommand } from "../commands/text";

type Command = TextCommand & { category?: string };

export async function loadTextCommands(dirPath: string) {
	const globPattern = join(dirPath, "**/*.ts");
	const filePaths = await glob(globPattern);

	const commands = new Collection<string, Command>();

	for (const filePath of filePaths) {
		const subPath = filePath.replace(dirPath, "");
		const { dir: category, name } = parse(subPath);

		const { default: command } = (await import(filePath)) as {
			default: Command;
		};

		commands.set(name, command);
		if (category) command.category = category;
	}

	console.log(`Loaded ${commands.size} text commands`);

	return commands;
}
