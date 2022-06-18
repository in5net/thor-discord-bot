import { getImg } from '../api/y7/mod.ts';
import command from './command.ts';

export default command(
  {
    desc: 'Get a random image from yyyyyyy.info',
    options: {}
  },
  async i => {
    try {
      const src = await getImg();
      return i.reply(src);
    } catch {
      return i.reply('So sad, looks like yyyyyyy.info is down ):');
    }
  }
);
