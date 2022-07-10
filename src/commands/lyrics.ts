// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import { command } from '$shared/command';

export default command(
  {
    name: 'lyrics',
    aliases: ['l'],
    desc: 'Gives you the lyrics of the current song or song by name',
    args: [
      {
        name: 'song name',
        type: 'string[]',
        desc: 'The name of the song to get the lyrics of',
        optional: true
      }
    ] as const
  },
  async (message, [song]) => {
    const { guildId } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    return player.lyrics(message, song?.join(' '));
  }
);
