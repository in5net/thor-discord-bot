import { getGIF } from '../api/y7/mod.ts';
import command from './command.ts';

export default command(
  {
    desc: 'Get a random GIF from yyyyyyy.info',
    options: {}
  },
  async i => {
    try {
      const src = await getGIF();
      return i.reply(src);
    } catch {
      return i.reply('So sad, looks like yyyyyyy.info is down ):');
    }
  }
);
