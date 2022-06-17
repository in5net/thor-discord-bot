import { formatDuration, getVideo } from '../../api/youtube/mod.ts';
import command from '../command.ts';
import { createEmbed } from './embed.ts';

export default command(
  {
    desc: 'Get information a YouTube video',
    options: {
      url: {
        desc: 'The URL of the video',
        type: 'string'
      }
    }
  },
  async (i, { url }) => {
    try {
      const {
        title,
        channel,
        thumbnail,
        description,
        duration,
        views,
        likes,
        favorites,
        comments,
        tags,
        uploadedAt
      } = await getVideo(url);

      const embed = createEmbed()
        .setTitle(title)
        .setAuthor({
          name: channel.title,
          url: `https://www.youtube.com/channel/${channel.id}`
        })
        .setURL(url)
        .setThumbnail(thumbnail.url)
        .setTimestamp(uploadedAt)
        .addFields(
          {
            name: 'Duration',
            value: formatDuration(duration)
          },
          {
            name: 'Views',
            value: views.toLocaleString()
          },
          {
            name: 'Likes',
            value: likes.toLocaleString()
          },
          {
            name: 'Comments',
            value: comments.toLocaleString()
          },
          {
            name: 'Favorites',
            value: favorites.toLocaleString()
          }
        );

      const maxDesc = 1024;
      if (description)
        embed.setDescription(
          description.length < maxDesc
            ? description
            : `${description.slice(0, maxDesc - 3)}...`
        );
      if (tags.length) embed.addField('Tags', tags.join(', '));

      return i.reply({
        embeds: [embed]
      });
    } catch (error) {
      console.error(error);
      return i.reply('Failed to get YouTube video', { ephemeral: true });
    }
  }
);
