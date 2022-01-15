import { getPlayer } from '../players';
import type Command from './command';

const queue: Command = (message, [numStr]) => {
  const { channel, guildId } = message;
  if (!guildId) return;
  const player = getPlayer(guildId);
  if (numStr) {
    const embed = player.songQueueEmbed(parseInt(numStr || '1'));
    if (embed) return channel.send({ embeds: [embed] });
    return channel.send(`Song #${numStr} not found in queue`);
  }
  return player.queueEmbed(message);
};
export default queue;
