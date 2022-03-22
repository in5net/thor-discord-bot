// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import type Command from './command';

const cmd: Command = {
  name: 'playlist',
  desc: 'Manage your personal playlists',
  aliases: ['pl'],
  async exec(message) {
    return message.channel.send('See `-help playlist`');
  },
  subcommands: [
    {
      name: 'get',
      desc: 'Shows the songs in your named playlist',
      usage: '<name>',
      aliases: ['show'],
      async exec(message, [name]) {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (!name) return message.channel.send('Please provide a name');
        return player.playlistGet(message, name);
      }
    },
    {
      name: 'list',
      desc: 'Shows a list of your saved playlists',
      async exec(message) {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        return player.playlistList(message);
      }
    },
    {
      name: 'save',
      desc: 'Saves the songs from a query or the queue to your named playlist',
      usage: '<name> <query?>',
      async exec(message, [name, ...query]) {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (!name) return message.channel.send('Please provide a name');
        return player.playlistSave(message, name, query.join(' '));
      }
    },
    {
      name: 'add',
      desc: 'Adds the songs from a query or the queue to your named playlist',
      usage: '<name> <query?>',
      async exec(message, [name, ...query]) {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (!name) return message.channel.send('Please provide a name');
        return player.playlistAdd(message, name, query.join(' '));
      }
    },
    {
      name: 'load',
      desc: 'Loads your named playlist into the queue',
      usage: '<name>',
      async exec(message, [name]) {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (message.member?.voice.channel?.type !== 'GUILD_VOICE')
          return message.reply(`${woof()}, you are not in a voice channel`);

        if (!name) return message.channel.send('Please provide a name');

        return player.playlistLoad(message, name);
      }
    },
    {
      name: 'loads',
      desc: 'Loads and shuffles your named playlist into the queue',
      usage: '<name>',
      async exec(message, [name]) {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (message.member?.voice.channel?.type !== 'GUILD_VOICE')
          return message.reply(`${woof()}, you are not in a voice channel`);

        if (!name) return message.channel.send('Please provide a name');

        return player.playlistLoads(message, name);
      }
    },
    {
      name: 'remove',
      desc: 'Removes your saved named playlist or track #n from that playlist',
      usage: '<name> <#n?>',
      aliases: ['rm'],
      async exec(message, [name, nStr]) {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (!name) return message.channel.send('Please provide a name');

        let n: number | undefined;
        if (nStr !== undefined) {
          n = parseInt(nStr);
          if (isNaN(n))
            return message.channel.send(`${nStr} isn't valid number`);
        }
        return player.playlistRemove(message, name, n);
      }
    }
  ]
};
export default cmd;
