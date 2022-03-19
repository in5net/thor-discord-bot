import { MessageAttachment } from 'discord.js';
import CatboysClient from 'catboys';

import type Command from './command';

const catboys = new CatboysClient();

const cmd: Command = {
  name: 'catboys',
  desc: 'Sends a random catboys.com image',
  async exec({ channel }) {
    const { url } = await catboys.sfw.catboy();
    return channel.send({
      files: [new MessageAttachment(url)]
    });
  }
};
export default cmd;
