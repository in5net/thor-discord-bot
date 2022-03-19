import { MessageAttachment } from 'discord.js';
import axios from 'axios';

import type Command from './command';

const cmd: Command = {
  name: 'waifu',
  desc: 'Sends a random waifu.im image',
  usage: 'gif?|nsfw?',
  async exec({ channel }, args) {
    const nsfw = args.includes('nsfw');
    if (nsfw && channel.type === 'GUILD_TEXT' && !channel.nsfw) return;

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
    if (!image) return;

    await channel.send({
      files: [new MessageAttachment(image.url)]
    });
  }
};
export default cmd;
