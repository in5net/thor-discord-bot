// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import type Command from './command';

const cmd: Command = {
  name: 'remove',
  desc: 'Removes song #n from the queue. You may use `last` to refer to the last song in the queue',
  usage: '<n>',
  aliases: ['rm'],
  async exec(message, args) {
    const { guildId, author } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    const [indexStr = ''] = args;
    const index =
      indexStr === 'last' ? player.queue.length - 1 : parseInt(indexStr) - 2;
    if (isNaN(index) || index < 0 || index >= player.queue.length)
      return message.reply(`${woof()}, please provide a valid number`);

    return player.remove(author.id, index);
  }
};
export default cmd;
