import { join } from "node:path";
import { Collection } from "discord.js";
import { glob } from "glob";
import { isSlashCommand, type SlashCommand } from "../commands/slash";

export async function loadSlashCommands(dirPath: string) {
	const globPattern = join(dirPath, "**/*.ts");
	const filePaths = await glob(globPattern);

	const commands = new Collection<string, SlashCommand>();

	for (const filePath of filePaths) {
		const module = (await import(filePath)) as Record<string, unknown>;
		if (!("default" in module)) continue;
		const command = module.default;
		if (!isSlashCommand(command)) continue;

		const subPath = filePath.replace(dirPath, "");
		const name = subPath
			.slice(1)
			.replaceAll("/", " ")
			.replace(".ts", "")
			.replace(" index", "");

		commands.set(name, command);
	}

	console.log(`Loaded ${commands.size} slash commands`);

	return commands;
}
