import { deploy } from '$services/commands/deploy';
import { CommandGroups, Commands } from '$services/commands/slash';
import * as messageCommands from './commands/messages';
import * as commandsData from './commands/mod';

console.log('Commands registering...');

const { default: oddNameCommands, ...normalCommands } = commandsData;

const commands = {
  ...normalCommands,
  ...oddNameCommands,
} as unknown as Commands | CommandGroups;

deploy(
  commands,
  Object.values(messageCommands),
  process.env.DISCORD_TOKEN,
  process.env.DISCORD_ID
)
  .then(buildCount => console.log(buildCount, 'commands registered'))
  .catch(console.error);
