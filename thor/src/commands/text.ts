import { getText } from '../yyyyyyy.info';
import { command } from '$shared/command';

export default command(
  {
    name: 'text',
    desc: 'Sends text from the best website on the internet: yyyyyyy.info',
    args: [] as const
  },
  async ({ channel }) => {
    const src = await getText();
    try {
      return await channel.send(src);
    } catch {
      return channel.send('So sad, looks like yyyyyyy.info is down ):');
    }
  }
);
