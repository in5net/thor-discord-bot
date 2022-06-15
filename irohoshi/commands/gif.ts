import { getGIF } from '../api/y7/mod.ts';
import command from './command.ts';

export default command(
  {
    desc: 'Get a random GIF from yyyyyyy.info',
    options: {}
  },
  async i => {
    while (true) {
      try {
        let src: string;
        try {
          src = await getGIF();
        } catch {
          return i.reply('So sad, looks like yyyyyyy.info is down ):');
        }
        return await i.reply(src);
      } catch {
        console.log('Error sending gif, trying again');
      }
    }
  }
);
