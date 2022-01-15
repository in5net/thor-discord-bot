import { getPlayer } from '../players';
import woof from '../woof';
import type Command from './command';

const move: Command = (message, args) => {
  const { guildId } = message;
  if (!guildId) return;
  const player = getPlayer(guildId);

  const channel = message.member?.voice.channel;
  if (channel?.type !== 'GUILD_VOICE')
    return message.reply(`${woof()}, you are not in a voice channel`);

  const [fromStr = '', toStr = ''] = args;
  const from = parseInt(fromStr) - 2;
  const to = parseInt(toStr) - 2;

  if (
    isNaN(from) ||
    isNaN(to) ||
    from < 0 ||
    to < 0 ||
    from >= player.queue.length ||
    to >= player.queue.length
  )
    return message.reply(`${woof()}, please provide valid numbers`);

  return player.move(from, to);
};
export default move;
