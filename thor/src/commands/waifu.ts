import axios from 'axios';
import { MessageEmbed } from 'discord.js';

import { incWeebCount } from '$services/users';
import type Command from './command';

interface Response {
  images: [
    {
      file: string;
      extension: `.${string}`;
      image_id: number;
      favourites: number;
      dominant_color: `#${string}`;
      source: string;
      uploaded_at: string;
      is_nsfw: boolean;
      url: string;
      preview_url: string;
      tags: {
        tag_id: number;
        name: string;
        description: string;
        is_nsfw: boolean;
      }[];
    }
  ];
}

const cmd: Command = {
  name: 'waifu',
  desc: 'Sends a random waifu.im image',
  usage: 'gif?|nsfw?',
  aliases: ['ワイフ', 'わいふ'],
  async exec({ channel, author: { id } }, args) {
    const nsfw = args.includes('nsfw');
    if (nsfw && channel.type === 'GUILD_TEXT' && !channel.nsfw)
      return channel.send('This channel is not marked as NSFW you cheeky boi.');

    const response = await axios.get<Response>('https://api.waifu.im/random', {
      params: {
        is_nsfw: nsfw,
        gif: args.includes('gif'),
        many: false
      }
    });
    const image = response.data.images[0];
    if (!image) return channel.send('No waifu found');

    const embed = new MessageEmbed()
      .setTitle(image.tags.map(t => t.name).join(', '))
      .setURL(image.url)
      .setDescription(image.tags.map(t => t.description).join(', '))
      .setColor(image.dominant_color)
      .setImage(image.url)
      .setAuthor({
        name: image.source,
        url: image.source
      })
      .setFooter({
        text: 'Powered by waifu.im',
        iconURL: 'https://waifu.im/favicon.ico'
      })
      .setTimestamp(new Date(image.uploaded_at));

    await channel.send({ embeds: [embed] });
    return incWeebCount(id);
  }
};
export default cmd;
