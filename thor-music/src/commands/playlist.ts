import help from './help';
import { getPlayer } from '../players';
import type Command from './command';

const playlist: Command = (message, args) => {
  const { guildId } = message;
  if (!guildId) return;
  const player = getPlayer(guildId);

  const subcommand = args[0];
  switch (subcommand) {
    case 'get': {
      const name = args[1];
      if (!name) return message.channel.send('Please provide a name');
      return player.playlistGet(message, name);
    }
    case 'list':
      return player.playlistList(message);
    case 'save': {
      const name = args[1];
      if (!name) return message.channel.send('Please provide a name');
      return player.playlistSave(message, name, args.slice(2).join(' '));
    }
    case 'add': {
      const name = args[1];
      if (!name) return message.channel.send('Please provide a name');
      return player.playlistAdd(message, name, args.slice(2).join(' '));
    }
    case 'load': {
      const name = args[1];
      if (!name) return message.channel.send('Please provide a name');
      return player.playlistLoad(message, name);
    }
    case 'loads': {
      const name = args[1];
      if (!name) return message.channel.send('Please provide a name');
      return player.playlistLoads(message, name);
    }
    case 'remove':
    case 'rm': {
      const name = args[1];
      if (!name) return message.channel.send('Please provide a name');
      return player.playlistRemove(message, name);
    }
    default:
      return help(message, ['playlist']);
  }
};
export default playlist;
