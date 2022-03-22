import axios from 'axios';

import { incWeebCount } from '$services/users';
import type Command from './command';

const cmd: Command = {
  name: 'waifu',
  desc: 'Sends a random waifu.im image',
  usage: 'gif?|nsfw?',
  aliases: ['ワイフ', 'わいふ'],
  async exec({ channel, author: { id } }, args) {
    const nsfw = args.includes('nsfw');
    if (nsfw && channel.type === 'GUILD_TEXT' && !channel.nsfw)
      return channel.send('This channel is not marked as NSFW you cheeky boi.');

    const response = await axios.get<{ images: { url: string }[] }>(
      'https://api.waifu.im/random',
      {
        params: {
          is_nsfw: nsfw,
          gif: args.includes('gif'),
          many: false
        }
      }
    );
    const image = response.data.images[0];
    if (!image) return channel.send('No waifu found');

    await channel.send(image.url);
    return incWeebCount(id);
  }
};
export default cmd;
