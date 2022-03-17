import { getText } from '../yyyyyyy.info';
import type Command from './command';

const cmd: Command = {
  name: 'text',
  desc: 'Sends text from the best website on the internet: yyyyyyy.info',
  async exec({ channel }) {
    const src = await getText();
    try {
      return await channel.send(src);
    } catch {
      return channel.send('So sad, looks like yyyyyyy.info is down ):');
    }
  }
};
export default cmd;
