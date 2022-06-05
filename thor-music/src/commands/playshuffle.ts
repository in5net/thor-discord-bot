// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import { command } from '$shared/command';

export default command(
  {
    name: 'playshuffle',
    aliases: ['ps'],
    desc: 'Adds and shuffles the queue',
    args: [
      {
        name: 'urls or YouTube searches',
        type: 'string[]',
        desc: 'The URLs or YouTube searches to play'
      }
    ] as const
  },
  async (message, args) => {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    return player.add(message, args.join(' '), true);
  }
);
