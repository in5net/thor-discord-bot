import { getPlayer } from '../players';
import woof from '../../../services/woof';
import type Command from './command';

const cmd: Command = {
  name: 'next',
  desc: 'Skips a song and plays the next one',
  aliases: ['n', 'skip'],
  async exec(message) {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    return player.next(message.author.id);
  }
};
export default cmd;
