import { searchVideos } from '../../../api/youtube/mod.ts';
import command from '../../command.ts';
import { createEmbed } from '../embed.ts';

export default command(
  {
    desc: 'Search for YouTube videos',
    options: {
      query: {
        desc: 'The search query to find videos',
        type: 'string'
      }
    }
  },
  async (i, { query }) => {
    try {
      const videos = await searchVideos(query);

      const embed = createEmbed()
        .setTitle(`Search results for "${query}"`)
        .setURL(
          `https://www.youtube.com/results?search_query=${query
            .split(' ')
            .join('+')}`
        )
        .addFields(
          ...videos.map(({ id, title }, i) => ({
            name: `${i + 1}. ${title}`,
            value: `https://youtu.be/${id}`
          }))
        );

      return i.reply({
        embeds: [embed]
      });
    } catch (error) {
      console.error(error);
      return i.reply('Failed to search for YouTube videos', {
        ephemeral: true
      });
    }
  }
);
