import { client, handle, init } from './deps.ts';

import * as commands from './commands/mod.ts';
import { Command, Commands, Subcommands } from './commands/command.ts';

init({ env: true });

const { default: oddNameCommands, ...normalCommands } = commands;

Object.entries({
  ...normalCommands,
  ...oddNameCommands
} as unknown as Commands | Subcommands).forEach(([name, command]) =>
  run(name, command)
);
function run(name: string, command: Command | Commands | Subcommands) {
  if (typeof command.desc === 'string') runCmd(name, command as Command);
  else {
    const { default: oddNameCommands, ...normalCommands } =
      commands as unknown as Commands | Subcommands;
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
