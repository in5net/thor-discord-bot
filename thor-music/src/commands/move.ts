import { getPlayer } from '../players';
import woof from '../../../services/woof';
import type Command from './command';

const cmd: Command = {
  name: 'move',
  desc: 'Moves song #i to position #j in the queue. You may use `last` to refer to the last song in the queue',
  usage: '<i> <j>',
  aliases: ['mv'],
  async exec(message, args) {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    const [fromStr = '', toStr = ''] = args;
    const from =
      fromStr === 'last' ? player.queue.length - 1 : parseInt(fromStr) - 2;
    const to = toStr === 'last' ? player.queue.length - 1 : parseInt(toStr) - 2;

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
  }
};
export default cmd;
