/* eslint-disable @typescript-eslint/naming-convention */
import { Client } from 'nekos-best.js';
import { MessageEmbed } from 'discord.js';

import { incCount } from '$services/users';
import { command } from '$shared/command';

const nekosBest = new Client();
const clientPromise = nekosBest.init();

export default command(
  {
    name: 'neko',
    aliases: ['猫'],
    desc: 'Sends a random nekos.best image',
    args: [] as const
  },
  async ({ channel, author: { id } }) => {
    const client = await clientPromise;
    const response = await client.fetchRandom('neko');
    const result = response.results[0];
    if (result) {
      const { url, artist_name, artist_href, source_url, anime_name } = result;
      const embed = new MessageEmbed();
      embed.setImage(url);
      if (artist_name && artist_href)
        embed.setAuthor({ name: artist_name, url: artist_href });
      if (source_url) embed.setURL(source_url);
      if (anime_name) embed.setTitle(anime_name);
      await channel.send({ embeds: [embed] });
      return incCount(id, 'weeb');
    }
    return channel.send('No neko found');
  }
);
