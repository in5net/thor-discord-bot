import { getPlayer } from '../players';
import type Command from './command';

const lyrics: Command = (message, args) => {
  const { guildId } = message;
  if (!guildId) return;
  const player = getPlayer(guildId);

  return player.lyrics(message, args.join(' '));
};
export default lyrics;
