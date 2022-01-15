import { getPlayer } from '../players';
import woof from '../woof';
import type Command from './command';

const play: Command = (message, args) => {
  const { guildId } = message;
  if (!guildId) return;
  const player = getPlayer(guildId);

  const channel = message.member?.voice.channel;
  if (channel?.type !== 'GUILD_VOICE')
    return message.reply(`${woof()}, you are not in a voice channel`);

  return player.add(message, args.join(' '));
};
export default play;
