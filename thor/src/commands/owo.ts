import { MessageAttachment } from 'discord.js';
import owo from 'owofy';
import axios from 'axios';

import type Command from './command';

const cmd: Command = {
  name: 'owo',
  desc: 'Owoifies a message',
  usage: '<message>',
  async exec(message, args) {
    await message.delete();

    const attachment = message.attachments.first();
    if (attachment) {
      const response = await axios(attachment.url);
      const input = response.data;
      const output = owo(input);
      const file = new MessageAttachment(Buffer.from(output), 'owo.txt');
      return message.channel.send({ files: [file] });
    }
    return message.channel.send(owo(args.join(' ')));
  }
};
export default cmd;
