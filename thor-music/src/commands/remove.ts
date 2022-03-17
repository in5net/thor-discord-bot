import { getPlayer } from '../players';
import woof from '../../../woof';
import type Command from './command';

const cmd: Command = {
  name: 'remove',
  desc: 'Removes song #n from the queue. You may use `last` to refer to the last song in the queue',
  usage: 'remove/rm <n>',
  aliases: ['rm'],
  async exec(message, args) {
    const { guildId } = message;
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

    return player.remove(index);
  }
};
export default cmd;
