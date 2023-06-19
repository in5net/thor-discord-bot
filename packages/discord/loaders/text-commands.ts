import { join, parse } from "node:path";
import { Collection } from "discord.js";
import { isTextCommand, type TextCommand } from "../commands/text";
import { noTestGlob } from "./shared";

export async function loadTextCommands(dirPath: string) {
	dirPath = dirPath.replaceAll("\\", "/");
	const globPattern = join(dirPath, "**/*.ts");
	const filePaths = await noTestGlob(globPattern);

	const commands = new Collection<string, TextCommand>();

	for (const filePath of filePaths) {
		const subPath = filePath.replace(dirPath, "");
		const { dir: category, name } = parse(subPath);

		const module = (await import(filePath)) as Record<string, unknown>;
		if (!("default" in module)) continue;
		const command = module.default;
		if (!isTextCommand(command)) continue;

		commands.set(name, command);
		if (category) command.category = category;
	}

	console.log(`Loaded ${commands.size} text commands`);

	return commands;
}
