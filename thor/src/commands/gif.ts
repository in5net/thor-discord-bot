import { MessageAttachment } from 'discord.js';

import { getGif } from '../yyyyyyy.info';
import type Command from './command';

const gif: Command = async ({ channel }) => {
  while (true) {
    try {
      const src = await getGif();
      return await channel.send({
        files: [new MessageAttachment(src)]
      });
    } catch {
      console.log('Error sending gif, trying again');
      return channel.send('So sad, looks like yyyyyyy.info is down ):');
    }
  }
};
export default gif;
