// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import { command } from '$shared/command';

export default command(
  {
    name: 'playnow',
    aliases: ['pn'],
    desc: 'Adds a song url or YouTube search, and files if given, to the front of the queue and starts playing it',
    args: [
      {
        name: 'urls or YouTube searches',
        type: 'string[]',
        desc: 'The URLs or YouTube searches to play'
      }
    ] as const
  },
  async (message, [queries]) => {
    const { guildId, author } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    return player.playnow(author.id, message, queries.join(' '));
  }
);
