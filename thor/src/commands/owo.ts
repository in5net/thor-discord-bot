import { MessageAttachment } from 'discord.js';
import owo from 'owofy';
import axios from 'axios';

import { command } from '$shared/command';

export default command(
  {
    name: 'owo',
    desc: 'Owoifies a message',
    args: [
      {
        name: 'message',
        type: 'string[]',
        desc: 'The message to owoify'
      }
    ] as const
  },
  async (message, [words]) => {
    await message.delete();

    const attachment = message.attachments.first();
    if (attachment) {
      const response = await axios(attachment.url);
      const input = response.data;
      const output = owo(input);
      const file = new MessageAttachment(Buffer.from(output), 'owo.txt');
      return message.channel.send({ files: [file] });
    }
    return message.channel.send(owo(words.join(' ')));
  }
);
