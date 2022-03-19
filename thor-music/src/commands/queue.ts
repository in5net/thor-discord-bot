import { getPlayer } from '../players';
import type Command from './command';

const cmd: Command = {
  name: 'queue',
  desc: "Shows what's in the queue or details about song #n",
  usage: '<n?>',
  aliases: ['q'],
  async exec(message, [numStr]) {
    const { channel, guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);
    if (numStr) {
      const embed = player.songQueueEmbed(parseInt(numStr || '1'));
      if (embed) return channel.send({ embeds: [embed] });
      return channel.send(`Song #${numStr} not found in queue`);
    }
    return player.queueEmbed(message);
  }
};
export default cmd;
