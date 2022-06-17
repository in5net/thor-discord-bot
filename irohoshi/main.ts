import { client, handle, init } from './deps.ts';

import * as commands from './commands/mod.ts';
import { Command, CommandGroups, Commands } from './commands/command.ts';

init({ env: true });

const { default: oddNameCommands = {}, ...normalCommands } = commands;
Object.entries({
  ...normalCommands,
  ...oddNameCommands
} as unknown as Commands | CommandGroups).forEach(([name, command]) =>
  run(name, command)
);
function run(name: string, command: Command | Commands | CommandGroups) {
  if (typeof command.desc === 'string') runCmd(name, command as Command);
  else {
    const { default: oddNameCommands = {}, ...normalCommands } =
      command as unknown as Commands | CommandGroups;
    Object.entries({ ...oddNameCommands, ...normalCommands }).forEach(
      ([subName, subCommand]) => run(`${name} ${subName}`, subCommand)
    );
  }
}
function runCmd(name: string, { options, handler }: Command) {
  handle(name, i =>
    handler(
      i,
      Object.fromEntries(
        Object.entries(options).map(([name, { default: d }]) => [
          name,
          i.option(name) ?? d
        ])
      )
    )
  );
}

client.on('interactionError', console.error);
