import { getPlayer } from '../players';
import woof from '../../../services/woof';
import type Command from './command';

const cmd: Command = {
  name: 'playnow',
  desc: 'Adds a song url or YouTube search, and files if given, to the front of the queue and starts playing it',
  usage: '<url or YouTube search>',
  aliases: ['pn'],
  async exec(message, args) {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    return player.playnow(message, args.join(' '));
  }
};
export default cmd;
