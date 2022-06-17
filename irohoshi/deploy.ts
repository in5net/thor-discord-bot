import 'https://deno.land/std@0.144.0/dotenv/load.ts';
import { ApplicationCommandOptionType, commands, init } from './deps.ts';

import * as commandsData from './commands/mod.ts';
import { Command, CommandOptionType, Commands } from './commands/command.ts';

init({ env: true });

const commandOptionTypeMap: Record<
  keyof CommandOptionType,
  ApplicationCommandOptionType
> = {
  int: ApplicationCommandOptionType.INTEGER,
  float: ApplicationCommandOptionType.NUMBER,
  string: ApplicationCommandOptionType.STRING,
  user: ApplicationCommandOptionType.USER,
  choice: ApplicationCommandOptionType.STRING
};

console.log('Commands registering...');

const { default: oddNameCommands, ...normalCommands } = commandsData;

const data = Object.entries({
  ...normalCommands,
  ...oddNameCommands
} as unknown as Record<string, Command | Commands>).map(
  ([name, commandOrCommands]) =>
    typeof commandOrCommands.desc === 'string'
      ? build(name, commandOrCommands as Command)
      : {
          name,
          description: name,
          options: Object.entries(commandOrCommands as Commands).map(
            ([name, command]) => ({
              type: ApplicationCommandOptionType.SUB_COMMAND,
              ...build(name, command)
            })
          )
        }
);
console.log('data:', data);
await commands.bulkEdit(data);
function build(name: string, { desc, options }: Command) {
  return {
    name,
    description: desc,
    options: Object.entries(options).map(
      ([name, { desc, type, min, max, optional, default: d, choices }]) => ({
        name,
        type: commandOptionTypeMap[type],
        description: desc,
        min_value: min,
        max_value: max,
        required: !optional && d === undefined,
        choices:
          type === 'choice'
            ? Array.isArray(choices)
              ? choices.map(choice => ({
                  name: choice,
                  value: choice
                }))
              : Object.entries(choices || {}).map(([name, description]) => ({
                  name,
                  description,
                  value: name
                }))
            : undefined
      })
    )
  };
}

console.log('Commands registered');
