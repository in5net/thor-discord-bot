import logger from "$lib/logger";
import { isTextCommand, type TextCommand } from "../commands/text";
import { noTestGlob } from "./shared";
import { pluralize } from "@iz7n/std/string";
import { Collection } from "discord.js";
import path from "node:path";

export async function loadTextCommands(dirPath: string) {
  dirPath = dirPath.replaceAll("\\", "/");
  const globPattern = path.join(dirPath, "**/*.ts");
  const filePaths = await noTestGlob(globPattern);

  const commands = new Collection<string, TextCommand>();

  for (const filePath of filePaths) {
    const subPath = filePath.replace(dirPath, "");
    const { dir, name } = path.parse(subPath);
    const category = dir.replace("/", "");

    const module = (await import(filePath)) as Record<string, unknown>;
    if (!("default" in module)) {
      continue;
    }
    const command = module.default;
    if (!isTextCommand(command)) {
      continue;
    }

    commands.set(name, command);
    if (category) {
      command.category = category;
    }
  }

  logger.info(
    `Loaded ${commands.size} text ${pluralize("command", commands.size)}`,
  );

  return commands;
}
