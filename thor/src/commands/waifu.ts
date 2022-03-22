import axios from 'axios';

import type Command from './command';

const cmd: Command = {
  name: 'waifu',
  desc: 'Sends a random waifu.im image',
  usage: 'gif?|nsfw?',
  aliases: ['ワイフ', 'わいふ'],
  async exec({ channel }, args) {
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

    return channel.send(image.url);
  }
};
export default cmd;
