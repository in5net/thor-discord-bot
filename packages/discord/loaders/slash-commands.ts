import { pluralize } from "@in5net/std/string";
import { Collection } from "discord.js";
import logger from "logger";
import { join } from "node:path";
import { isSlashCommand, type SlashCommand } from "../commands/slash";
import { noTestGlob } from "./shared";

export async function loadSlashCommands(dirPath: string) {
	dirPath = dirPath.replaceAll("\\", "/");
	const globPattern = join(dirPath, "**/*.ts");
	const filePaths = await noTestGlob(globPattern);

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

	logger.info(
		`Loaded ${commands.size} slash ${pluralize("command", commands.size)}`,
	);

	return commands;
}
