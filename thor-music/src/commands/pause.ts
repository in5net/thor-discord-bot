// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import type Command from './command';

const cmd: Command = {
  name: 'pause',
  desc: 'Pauses/unpauses the current song',
  async exec(message) {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    return player.pause(message.author.id);
  }
};
export default cmd;
