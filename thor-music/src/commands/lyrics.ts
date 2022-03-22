// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import type Command from './command';

const cmd: Command = {
  name: 'lyrics',
  desc: 'Gives you the lyrics of the current song or song by name',
  usage: '<song name?>',
  aliases: ['l'],
  async exec(message, args) {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    return player.lyrics(message, args.join(' '));
  }
};
export default cmd;
