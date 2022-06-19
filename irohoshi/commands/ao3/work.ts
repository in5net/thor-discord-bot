import {
  contentWarnings,
  getUser,
  getWork,
  getWorkId,
  ratings,
  relationshipOrientations
} from '../../api/ao3/mod.ts';
import command from '../command.ts';
import { createEmbed } from './embed.ts';

export default command(
  {
    desc: 'Get information on a work from Archive of Our Own',
    options: {
      url: {
        desc: 'The URL of the work',
        type: 'string'
      }
    }
  },
  async (i, { url }) => {
    try {
      const id = getWorkId(url);
      const {
        title,
        url: workUrl,
        author,
        rating,
        warnings,
        categories,
        relationships,
        characters,
        tags,
        language,
        series,
        stats: { published, updated, words, chapters, kudos, bookmarks, hits },
        symbols
      } = await getWork(id);
      const { url: authorURL, iconURL } = await getUser(author);

      const embed = createEmbed()
        .setTitle(title)
        .setAuthor({ name: author, url: authorURL, icon_url: iconURL })
        .setURL(workUrl)
        .setThumbnail(
          `https://files.in5net.dev/ao3/squares/${symbols.rating}_${symbols.orientation}_${symbols.warning}_${symbols.complete}.png`
        );
      if (rating) embed.addField('Rating', ratings[rating]);
      if (warnings?.length)
        embed.addField(
          'Warnings',
          warnings.map(warning => contentWarnings[warning]).join(', ')
        );
      else
        embed.addField('Warnings', 'Creator Chose Not To Use Archive Warnings');
      if (categories.length)
        embed.addField(
          'Categories',
          categories
            .map(category => relationshipOrientations[category])
            .join(', ')
        );
      if (relationships.length)
        embed.addField('Relationships', relationships.join(', '));
      if (characters.length)
        embed.addField('Characters', characters.join(', '));
      if (tags.length) embed.addField('Tags', tags.join(', '));
      embed.addField('Language', language);
      if (series)
        embed.addField(
          'Series',
          `[${series.title}](https://archiveofourown.org/series/${series.id})`
        );

      embed.addField(
        'Stats:',
        `* Published: ${published.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })}${
          updated
            ? `* Updated: ${updated.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}`
            : ''
        }
* Words: ${words}
* Chapters: ${chapters[0]}/${chapters[1] || '?'}
* Kudos: ${kudos}
* Bookmarks: ${bookmarks}
* Hits: ${hits}`
      );

      return i.reply({
        embeds: [embed],
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      return i.reply('Invalid AO3 url', { ephemeral: true });
    }
  }
);
