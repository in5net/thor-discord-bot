import './env.ts';
import { ApplicationCommandOptionType, commands, init } from './deps.ts';

import * as commandsData from './commands/mod.ts';
import {
  Command,
  CommandGroups,
  CommandOptionType,
  Commands
} from './commands/command.ts';

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
let buildCount = 0;

const { default: oddNameCommands, ...normalCommands } = commandsData;

const data = Object.entries({
  ...normalCommands,
  ...oddNameCommands
} as unknown as Commands | CommandGroups).map(([name, command]) =>
  typeof command.desc === 'string'
    ? build(name, command as Command)
    : typeof Object.values(command as Commands | CommandGroups)[0].desc ===
      'string'
    ? {
        name,
        description: name,
        options: Object.entries(command as Commands).map(([name, command]) => ({
          type: ApplicationCommandOptionType.SUB_COMMAND,
          ...build(name, command)
        }))
      }
    : {
        name,
        description: name,
        options: Object.entries(command as CommandGroups).map(
          ([name, command]) => ({
            type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
            name,
            description: name,
            options: Object.entries(command as Commands).map(
              ([name, command]) => ({
                type: ApplicationCommandOptionType.SUB_COMMAND,
                ...build(name, command)
              })
            )
          })
        )
      }
);

function build(name: string, { desc, options }: Command) {
  buildCount++;
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

await commands.bulkEdit(data);
console.log(buildCount, 'commands registered');
