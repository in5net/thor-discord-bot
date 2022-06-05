// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import { command } from '$shared/command';

export default command(
  {
    name: 'queue',
    aliases: ['q'],
    desc: "Shows what's in the queue or details about song #n",
    args: [
      {
        name: 'n',
        type: 'int',
        desc: 'The song number to show details about',
        optional: true
      }
    ] as const
  },
  async (message, [n]) => {
    const { channel, guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);
    if (typeof n === 'number') {
      const embed = player.songQueueEmbed(n);
      if (embed) return channel.send({ embeds: [embed] });
      return channel.send(`Song #${n} not found in queue`);
    }
    return player.queueEmbed(message);
  }
);
