import help from './help';
import { getPlayer } from '../players';
import woof from '../../../woof';
import type Command from './command';

const playlist: Command = (message, args) => {
  const { guildId } = message;
  if (!guildId) return;
  const player = getPlayer(guildId);

  const channel = message.member?.voice.channel;

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
      if (channel?.type !== 'GUILD_VOICE')
        return message.reply(`${woof()}, you are not in a voice channel`);
      const name = args[1];
      if (!name) return message.channel.send('Please provide a name');
      return player.playlistLoad(message, name);
    }
    case 'loads': {
      if (channel?.type !== 'GUILD_VOICE')
        return message.reply(`${woof()}, you are not in a voice channel`);
      const name = args[1];
      if (!name) return message.channel.send('Please provide a name');
      return player.playlistLoads(message, name);
    }
    case 'remove':
    case 'rm': {
      const name = args[1];
      if (!name) return message.channel.send('Please provide a name');
      const nStr = args[2];
      let n: number | undefined;
      if (nStr !== undefined) {
        n = parseInt(nStr);
        if (isNaN(n)) return message.channel.send(`${nStr} isn't valid number`);
      }
      return player.playlistRemove(message, name, n);
    }
    default:
      return help(message, ['playlist']);
  }
};
export default playlist;
