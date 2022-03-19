import { getPlayer } from '../players';
import woof from '../../../services/woof';
import type Command from './command';

const cmd: Command = {
  name: 'playshuffle',
  desc: 'Adds and shuffles the queue',
  usage: '<url or YouTube search>',
  async exec(message, args) {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    return player.add(message, args.join(' '), true);
  }
};
export default cmd;
