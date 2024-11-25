import logger from "$lib/logger";
import { type ButtonHandler, isButtonHandler } from "../commands/button";
import { noTestGlob } from "./shared";
import { pluralize } from "@iz7n/std/string";
import { Collection } from "discord.js";
import path from "node:path";

export async function loadButtons(dirPath: string) {
  dirPath = dirPath.replaceAll("\\", "/");
  const globPattern = path.join(dirPath, "**/*.ts");

  const buttons = new Collection<string, ButtonHandler>();

  for await (const filePath of noTestGlob(globPattern)) {
    const module = (await import(filePath)) as Record<string, unknown>;
    if (!("default" in module)) {
      continue;
    }
    const command = module.default;
    if (!isButtonHandler(command)) {
      continue;
    }

    const subPath = filePath.replace(dirPath, "");
    const name = subPath
      .slice(1)
      .replaceAll("/", " ")
      .replace(".ts", "")
      .replace(" index", "");

    buttons.set(name, command);
  }

  logger.info(`Loaded ${buttons.size} ${pluralize("button", buttons.size)}`);

  return buttons;
}
