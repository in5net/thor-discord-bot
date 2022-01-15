import { MessageAttachment } from 'discord.js';

import { getGif } from '../yyyyyyy.info';
import type Command from './command';

const gif: Command = async ({ channel }) => {
  while (true) {
    try {
      const src = await getGif();
      await channel.send({
        files: [new MessageAttachment(src)]
      });
      return;
    } catch {
      console.log('Error sending gif, trying again');
    }
  }
};
export default gif;
