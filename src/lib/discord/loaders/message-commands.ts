import logger from "$lib/logger";
import { isMessageCommand, type MessageCommand } from "../commands/message";
import { noTestGlob } from "./shared";
import { pluralize } from "@iz7n/std/string";
import { Collection } from "discord.js";
import path from "node:path";

export async function loadMessageCommands(dirPath: string) {
  dirPath = dirPath.replaceAll("\\", "/");
  const globPattern = path.join(dirPath, "**/*.ts");
  const filePaths = await noTestGlob(globPattern);

  const commands = new Collection<string, MessageCommand>();

  for (const filePath of filePaths) {
    const subPath = filePath.replace(dirPath, "");
    const { name } = path.parse(subPath);

    const module = (await import(filePath)) as Record<string, unknown>;
    if (!("default" in module)) {
      continue;
    }
    const command = module.default;
    if (!isMessageCommand(command)) {
      continue;
    }

    commands.set(name, command);
  }

  logger.info(
    `Loaded ${commands.size} message ${pluralize("command", commands.size)}`,
  );

  return commands;
}
