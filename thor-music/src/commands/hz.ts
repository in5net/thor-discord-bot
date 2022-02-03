import { getPlayer } from '../players';
import woof from '../woof';
import type Command from './command';

const cmd: Command = (message, args) => {
  const { guildId } = message;
  if (!guildId) return;
  const player = getPlayer(guildId);

  const channel = message.member?.voice.channel;
  if (channel?.type !== 'GUILD_VOICE')
    return message.reply(`${woof()}, you are not in a voice channel`);

  const [hzStr] = args;
  if (!hzStr)
    return message.reply(`${woof()}, you need to specify a frequency`);
  const hz = parseInt(hzStr);
  if (isNaN(hz))
    return message.reply(`${woof()}, you need to specify a number`);
  if (hz < 0)
    return message.reply(`${woof()}, you need to specify a positive number`);

  return player.hz(message, hz);
};
export default cmd;
