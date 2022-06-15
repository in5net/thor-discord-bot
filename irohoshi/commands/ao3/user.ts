import { getNameFromURL, getUser } from '../../api/ao3/mod.ts';
import command from '../command.ts';
import { createEmbed } from './embed.ts';

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

      const embed = createEmbed()
        .setColor('#990000')
        .setTitle(name)
        .setURL(authorURL)
        .setThumbnail(iconURL);

      return i.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return i.reply('Invalid AO3 url', { ephemeral: true });
    }
  }
);
