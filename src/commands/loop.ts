// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import { command } from '$shared/command';

export default command(
  {
    name: 'loop',
    desc: 'Loops the queue',
    args: [] as const
  },
  async message => {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    return player.toggleLoop();
  }
);
