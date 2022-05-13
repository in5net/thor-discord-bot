// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import type Command from './command';

const cmd: Command = {
  name: 'playnext',
  desc: 'Adds a song url or YouTube search, and files if given, to the front of the queue',
  usage: '<url or YouTube search>',
  aliases: ['pnx'],
  async exec(message, args) {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    await player.add(message, args.join(' '));
    return player.move(player.queue.length - 1, 0);
  }
};
export default cmd;
