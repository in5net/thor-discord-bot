import { join, parse } from "node:path";
import { Collection } from "discord.js";
import { glob } from "glob";
import { type MessageCommand, isMessageCommand } from "../commands/message";

export async function loadMessageCommands(dirPath: string) {
	dirPath = dirPath.replaceAll("\\", "/");
	const globPattern = join(dirPath, "**/*.ts");
	const filePaths = await glob(globPattern);

	const commands = new Collection<string, MessageCommand>();

	for (const filePath of filePaths) {
		const subPath = filePath.replace(dirPath, "");
		const { name } = parse(subPath);

		const module = (await import(filePath)) as Record<string, unknown>;
		if (!("default" in module)) continue;
		const command = module.default;
		if (!isMessageCommand(command)) continue;

		commands.set(name, command);
	}

	console.log(`Loaded ${commands.size} text commands`);

	return commands;
}
