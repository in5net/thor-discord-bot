import { getPlayer } from '../players';
import woof from '../woof';
import type Command from './command';

const next: Command = (message, [nStr]) => {
  const { guildId } = message;
  if (!guildId) return;
  const player = getPlayer(guildId);

  const channel = message.member?.voice.channel;
  if (channel?.type !== 'GUILD_VOICE')
    return message.reply(`${woof()}, you are not in a voice channel`);

  let n: number | undefined;
  if (nStr) {
    const n = parseInt(nStr);
    if (isNaN(n) || n < 1 || n >= player.queue.size)
      return message.reply(`${woof()}, please provide a valid number`);
  }

  return player.next(message.author.id, n);
};
export default next;
