import { deploy } from '$services/commands/deploy';
import { CommandGroups, Commands } from '$services/commands/slash';
import * as commands from './commands';

console.log('Commands registering...');

deploy(
  commands as unknown as Commands | CommandGroups,
  process.env.DISCORD_TOKEN || '',
  process.env.DISCORD_ID || ''
)
  .then(buildCount => console.log(buildCount, 'commands registered'))
  .catch(console.error);
