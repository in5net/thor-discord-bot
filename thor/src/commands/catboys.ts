import { MessageAttachment } from 'discord.js';
import axios from 'axios';

import type Command from './command';

const cmd: Command = {
  name: 'catboys',
  desc: 'Sends a random catboys.com image',
  async exec({ channel }) {
    const response = await axios.get<{ url: string }>(
      'https://api.catboys.com/img'
    );
    return channel.send({
      files: [new MessageAttachment(response.data.url)]
    });
  }
};
export default cmd;
