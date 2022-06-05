// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import { command } from '$shared/command';

export default command(
  {
    name: 'playlist',
    aliases: ['pl'],
    desc: 'Manage your personal playlists',
    args: [] as const
  },
  message => message.channel.send('See `-help playlist`'),
  [
    command(
      {
        name: 'get',
        desc: 'Shows the songs in your named playlist',
        aliases: ['show'],
        args: [
          {
            name: 'name',
            type: 'string',
            desc: 'The name of the playlist to show'
          }
        ] as const
      },
      async (message, [name]) => {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (!name) return message.channel.send('Please provide a name');
        return player.playlistGet(message, name);
      }
    ),
    command(
      {
        name: 'list',
        aliases: ['ls'],
        desc: 'Shows a list of your saved playlists',
        args: [] as const
      },
      async message => {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        return player.playlistList(message);
      }
    ),
    command(
      {
        name: 'save',
        desc: 'Saves the songs from a query or the queue to your named playlist',
        args: [
          {
            name: 'name',
            type: 'string',
            desc: 'The name of the playlist to save to'
          },
          {
            name: 'query',
            type: 'string[]',
            desc: 'The query to save',
            optional: true
          }
        ] as const
      },
      async (message, [name, query]) => {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (!name) return message.channel.send('Please provide a name');
        return player.playlistSave(message, name, query?.join(' '));
      }
    ),
    command(
      {
        name: 'add',
        desc: 'Adds the songs from a query or the queue to your named playlist',
        args: [
          {
            name: 'name',
            type: 'string',
            desc: 'The name of the playlist to save to'
          },
          {
            name: 'query',
            type: 'string[]',
            desc: 'The query to save',
            optional: true
          }
        ] as const
      },
      async (message, [name, query]) => {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (!name) return message.channel.send('Please provide a name');
        return player.playlistAdd(message, name, query?.join(' '));
      }
    ),
    command(
      {
        name: 'load',
        desc: 'Loads your named playlist into the queue',
        args: [
          {
            name: 'names',
            type: 'string[]',
            desc: 'The names of the playlists load into the queue'
          }
        ] as const
      },
      async (message, [names]) => {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (message.member?.voice.channel?.type !== 'GUILD_VOICE')
          return message.reply(`${woof()}, you are not in a voice channel`);

        if (!names.length) return message.channel.send('Please provide a name');

        return player.playlistLoad(message, names);
      }
    ),
    command(
      {
        name: 'loads',
        desc: 'Loads and shuffles your named playlist into the queue',
        args: [
          {
            name: 'names',
            type: 'string[]',
            desc: 'The names of the playlists load into the queue'
          }
        ] as const
      },
      async (message, [names]) => {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        if (message.member?.voice.channel?.type !== 'GUILD_VOICE')
          return message.reply(`${woof()}, you are not in a voice channel`);

        if (!names.length) return message.channel.send('Please provide a name');

        return player.playlistLoads(message, names);
      }
    ),
    command(
      {
        name: 'remove',
        aliases: ['rm'],
        desc: 'Removes your saved named playlist or track #n from that playlist',
        args: [
          {
            name: 'name',
            type: 'string',
            desc: 'The name of the playlist to remove, or remove from'
          },
          {
            name: 'n',
            type: 'int',
            desc: 'The track number to remove',
            optional: true
          }
        ] as const
      },
      async (message, [name, n]) => {
        const { guildId } = message;
        if (!guildId) return;
        const player = getPlayer(guildId);

        return player.playlistRemove(message, name, n);
      }
    )
  ] as const
);
