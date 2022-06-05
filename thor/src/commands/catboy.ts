/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import { MessageEmbed } from 'discord.js';

import { incCount } from '$services/users';
import { createCommand } from '$shared/command';

interface Response {
  url: string;
  artist: string;
  artist_url: string;
  source_url: string;
  error: string;
}

export default createCommand(
  {
    name: 'catboy',
    desc: 'Sends a random catboys.com image',
    args: [] as const
  },
  async ({ channel, author: { id } }) => {
    const response = await axios.get<Response>('https://api.catboys.com/img');
    const { url, artist, artist_url, source_url } = response.data;

    const embed = new MessageEmbed()
      .setTitle('Catboy')
      .setImage(url)
      .setFooter({
        text: 'Powered by catboys.com',
        iconURL: 'https://catboys.com/favicon.png'
      });
    if (source_url.startsWith('http')) embed.setURL(source_url);
    if (artist_url.startsWith('http'))
      embed.setAuthor({ name: artist, url: artist_url });

    await channel.send({ embeds: [embed] });
    return incCount(id, 'weeb');
  }
);
