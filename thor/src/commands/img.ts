import {
  InteractionCollector,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed
} from 'discord.js';

import { getImg } from '../yyyyyyy.info';
import ImageSearch from '../image-search';
import type Command from './command';

let collector: InteractionCollector<MessageComponentInteraction> | undefined;

const cmd: Command = {
  name: 'img',
  desc: 'Sends an image from the best website on the internet, yyyyyyy.info, or from Google Search',
  usage: '<search?>',
  aliases: ['pic'],
  async exec({ channel, author }, args) {
    if (!args.length) {
      const src = await getImg();
      try {
        return await channel.send({
          files: [new MessageAttachment(src)]
        });
      } catch {
        return channel.send('So sad, looks like yyyyyyy.info is down ):');
      }
    }

    const query = args.join(' ');
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
};
export default cmd;
