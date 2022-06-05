import {
  InteractionCollector,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed
} from 'discord.js';

import { getImg } from '../yyyyyyy.info';
import ImageSearch from '../image-search';
import { command } from '$shared/command';

let collector: InteractionCollector<MessageComponentInteraction> | undefined;

export default command(
  {
    name: 'img',
    aliases: ['pic', '絵'],
    desc: 'Sends an image from the best website on the internet, yyyyyyy.info, or from Google Search',
    args: [
      {
        name: 'search',
        type: 'string[]',
        desc: 'The search terms to use for a Google image search',
        optional: true
      }
    ] as const
  },
  async ({ channel, author }, [words]) => {
    if (!words) {
      const src = await getImg();
      try {
        return await channel.send(src);
      } catch {
        return channel.send('So sad, looks like yyyyyyy.info is down ):');
      }
    }

    const query = words.join(' ');
    const search = new ImageSearch(query);

    const embed = new MessageEmbed().setImage(await search.next());
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('prev')
        .setEmoji('⬅️')
        .setStyle('PRIMARY')
        .setDisabled(),
      new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('PRIMARY')
    );
    const msg = await channel.send({
      embeds: [embed],
      components: [row]
    });
    collector?.stop();
    collector = msg
      .createMessageComponentCollector({
        filter: i => i.user.id === author.id,
        time: 60_000
      })
      .on('collect', async i => {
        try {
          const embed = new MessageEmbed().setImage(
            i.customId === 'prev' ? await search.prev() : await search.next()
          );
          row.components[0]?.setDisabled(!search.hasPrev());
          await msg.edit({
            embeds: [embed],
            components: [row]
          });
          await i.update({
            files: []
          });
        } catch {
          await msg.edit('Some error occurred...imagine').catch();
        }
      });
    return undefined;
  }
);
