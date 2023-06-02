import { Collection } from 'discord.js';
import { glob } from 'glob';
import { basename } from 'node:path';

import { SlashCommand } from '$services/commands/slash';

export async function loadSlashCommands() {
  const dirPath = new URL(
    '../commands/slash/*.ts',
    import.meta.url
  ).pathname.replaceAll('\\', '/');
  const filePaths = await glob(dirPath);

  const commands = new Collection<string, SlashCommand>();

  for (const filePath of filePaths) {
    const commandModule = await import(filePath);
    const command: SlashCommand = commandModule.default;

    const commandName = basename(filePath, '.ts');

    commands.set(commandName, command);
  }
  console.log(`Loaded ${commands.size} slash commands`);

  return commands;
}
