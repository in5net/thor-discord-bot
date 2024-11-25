import logger from "$lib/logger";
import { isSlashCommand, type SlashCommand } from "../commands/slash";
import { noTestGlob } from "./shared";
import { pluralize } from "@iz7n/std/string";
import { Collection } from "discord.js";
import path from "node:path";

export async function loadSlashCommands(dirPath: string) {
  dirPath = dirPath.replaceAll("\\", "/");
  const globPattern = path.join(dirPath, "**/*.ts");

  const commands = new Collection<string, SlashCommand>();

  for await (const filePath of noTestGlob(globPattern)) {
    const module = (await import(filePath)) as Record<string, unknown>;
    if (!("default" in module)) {
      continue;
    }
    const command = module.default;
    if (!isSlashCommand(command)) {
      continue;
    }

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
