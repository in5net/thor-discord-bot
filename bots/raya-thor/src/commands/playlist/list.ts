import { EmbedBuilder } from 'discord.js';

import command from '$services/commands/slash';
import { COLOR } from '$services/env';
import * as playlist from '../../music/playlist';

export default command(
  {
    desc: 'Shows a list of your saved playlists',
    options: {}
  },
  async i => {
    const { user } = i;
    const playlists = await playlist.list(user.id);
    const desc = playlists.join('\n');
    const embed = new EmbedBuilder()
      .setTitle('Playlists')
      .setColor(COLOR)
      .setAuthor({
        name: user.username,
        iconURL: user.avatarURL() || undefined
      })
      .setDescription(desc.length > 1000 ? `${desc.slice(0, 1000)}...` : desc);
    await i.reply({ embeds: [embed], ephemeral: true });
  }
);
