import { Embed, InteractionResponseFlags } from '../deps.ts';
import { incCount } from '../users.ts';

import command from './command.ts';

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

export default command(
  {
    desc: 'Sends a random waifu.im image',
    options: {
      option: {
        type: 'choice',
        desc: 'Additional query option',
        choices: {
          gif: 'Get a GIF instead of a normal image',
          nsfw: 'Get a naughty image'
        },
        optional: true
      }
    }
  },
  async (i, { option }) => {
    const url = new URL('https://api.waifu.im/random');
    if (option === 'gif') url.searchParams.append('gif', 'true');
    else if (option === 'nsfw') url.searchParams.append('is_nsfw', 'true');
    const response = await fetch(url);
    const data: Response = await response.json();
    const image = data.images[0];
    console.log(data);
    if (!image) throw new Error('No waifu found');

    const embed = new Embed()
      .setTitle(image.tags.map(t => t.name).join(', '))
      .setURL(image.url)
      .setDescription(image.tags.map(t => t.description).join(', '))
      .setColor(image.dominant_color)
      .setImage(image.url)
      .setAuthor({
        name: image.source,
        url: image.source
      })
      .setFooter('Powered by waifu.im', 'https://waifu.im/favicon.ico')
      .setTimestamp(new Date(image.uploaded_at));

    await i.reply({ embeds: [embed], ephemeral: true });
    return incCount(i.user.id, 'weeb');
  }
);
