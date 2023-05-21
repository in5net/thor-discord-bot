import { getNameFromURL, getUser } from '@in5net/limitless/api/ao3/mod';

import command from '$commands/slash';
import { createEmbedBuilder } from '../embed';

export default command(
  {
    desc: 'Get information on a user from Archive of Our Own',
    options: {
      url: {
        desc: 'The URL of the user',
        type: 'string'
      }
    }
  },
  async (i, { url }) => {
    try {
      const id = getNameFromURL(url);
      const { name, url: authorURL, iconURL } = await getUser(id);

      const embed = createEmbedBuilder()
        .setColor('#990000')
        .setTitle(name)
        .setURL(authorURL)
        .setThumbnail(iconURL);

      return await i.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return i.reply({ content: 'Invalid AO3 url', ephemeral: true });
    }
  }
);
