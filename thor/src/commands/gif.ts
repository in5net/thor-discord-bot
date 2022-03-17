import { MessageAttachment } from 'discord.js';

import { getGif } from '../yyyyyyy.info';
import type Command from './command';

const cmd: Command = {
  name: 'gif',
  desc: 'Sends a gif from the best website on the internet: yyyyyyy.info',
  async exec({ channel }) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        let src: string;
        try {
          src = await getGif();
        } catch {
          return channel.send('So sad, looks like yyyyyyy.info is down ):');
        }
        return await channel.send({
          files: [new MessageAttachment(src)]
        });
      } catch {
        console.log('Error sending gif, trying again');
      }
    }
  }
};
export default cmd;
