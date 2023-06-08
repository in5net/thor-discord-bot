import { join } from "node:path";
import { Collection } from "discord.js";
import { glob } from "glob";
import { type SlashCommand } from "../commands/slash";

export async function loadSlashCommands(dirPath: string) {
	const globPattern = join(dirPath, "**/*.ts");
	const filePaths = await glob(globPattern);

	const commands = new Collection<string, SlashCommand>();

	for (const filePath of filePaths) {
		const { default: command } = (await import(filePath)) as {
			default: SlashCommand;
		};

		const subPath = filePath.replace(dirPath, "");
		const name = subPath.replaceAll("/", " ").replace(".ts", "");

		commands.set(name, command);
	}

	console.log(`Loaded ${commands.size} slash commands`);

	return commands;
}
