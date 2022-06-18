import { Embed } from '../deps.ts';
import { incCount } from '../users.ts';

import command from './command.ts';

interface Response {
  url: string;
  artist: string;
  artist_url: string;
  source_url: string;
  error: string;
}

export default command(
  {
    desc: 'Sends a random catboys.com image',
    options: {}
  },
  async i => {
    const response = await fetch('https://api.catboys.com/img');
    const data: Response = await response.json();
    const { url, artist, artist_url, source_url } = data;

    const embed = new Embed()
      .setTitle('Catboy')
      .setImage(url)
      .setFooter('Powered by catboys.com', 'https://catboys.com/favicon.png');
    if (source_url.startsWith('http')) embed.setURL(source_url);
    if (artist_url.startsWith('http'))
      embed.setAuthor({ name: artist, url: artist_url });

    await i.reply({ embeds: [embed], ephemeral: true });
    return incCount(i.user.id, 'weeb');
  }
);
