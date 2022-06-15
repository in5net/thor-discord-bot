import { client, handle, init } from './deps.ts';

import * as commands from './commands/mod.ts';
import { Command, Commands } from './commands/command.ts';

init({ env: true });

Object.entries(
  commands as unknown as Record<string, Command | Commands>
).forEach(([name, commandOrCommands]) =>
  typeof commandOrCommands.desc === 'string'
    ? run(name, commandOrCommands as Command)
    : Object.entries(commandOrCommands as Commands).forEach(
        ([subName, command]) => run(`${name} ${subName}`, command)
      )
);
function run(name: string, { options, handler }: Command) {
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
