import owofy from 'https://cdn.skypack.dev/owofy@v2.0.0?dts';
import { MessageAttachment } from '../deps.ts';

import command from './command.ts';

export default command(
  {
    desc: 'Owoifies a message',
    options: {
      message: {
        type: 'string',
        desc: 'The message to owoify'
      }
    }
  },
  async (i, { message }) => {
    const attachment = i.message?.attachments[0];
    if (attachment) {
      const response = await fetch(attachment.url);
      const input = await response.text();
      const output = owofy(input);
      const file = new MessageAttachment('owo.txt', output);
      return i.reply({ files: [file] });
    }
    return i.reply(owofy(message));
  }
);
