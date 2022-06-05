import { MessageAttachment, MessageEmbed } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import { getUser, getWork, getWorkId } from '@limitlesspc/limitless/api/ao3';
import {
  contentWarnings,
  relationshipOrientations,
  ratings as ao3Ratings
} from '@limitlesspc/limitless/api/ao3/work';
import type { Work } from '@limitlesspc/limitless/api/ao3/work';

import { command } from '$shared/command';

export default command(
  {
    name: 'ao3',
    desc: 'Gets data of a work on Archive of Our Own',
    args: [
      {
        name: 'url',
        type: 'string',
        desc: 'The url of the work to get info on'
      }
    ] as const
  },
  async ({ channel }, [url]) => {
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
      const { url: authorUrl, iconUrl } = await getUser(author);

      const canvas = await drawLegendarySquare(symbols);
      const squareFile = new MessageAttachment(
        canvas.toBuffer(),
        'legendary-square.png'
      );

      const embed = new MessageEmbed()
        .setColor('#990000')
        .setTitle(title)
        .setAuthor({ name: author, url: authorUrl, iconURL: iconUrl })
        .setURL(workUrl)
        .setThumbnail('attachment://legendary-square.png')
        .setFooter({
          text: 'Archive of Our Own',
          iconURL:
            'https://upload.wikimedia.org/wikipedia/commons/8/88/Archive_of_Our_Own_logo.png'
        });
      if (rating) embed.addField('Rating', ao3Ratings[rating]);
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

      return await channel.send({
        embeds: [embed],
        files: [squareFile]
      });
    } catch (error) {
      console.error(error);
      return channel.send('Invalid AO3 url');
    }
  }
);

async function drawLegendarySquare({
  rating,
  orientation,
  warning,
  complete
}: Work['symbols']) {
  const canvas = createCanvas(56, 56);
  const ctx = canvas.getContext('2d');

  const ratingImage = await loadImage(rating);
  const orientationImage = await loadImage(orientation);
  const warningImage = await loadImage(warning);
  const completeImage = await loadImage(complete);

  ctx.drawImage(ratingImage, 0, 0, 25, 25);
  ctx.drawImage(orientationImage, 31, 0, 25, 25);
  ctx.drawImage(warningImage, 0, 31, 25, 25);
  ctx.drawImage(completeImage, 31, 31, 25, 25);

  return canvas;
}
