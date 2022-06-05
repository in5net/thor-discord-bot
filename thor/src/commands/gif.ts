import { getGif } from '../yyyyyyy.info';
import { command } from '$shared/command';

export default command(
  {
    name: 'gif',
    desc: 'Sends a gif from the best website on the internet: yyyyyyy.info',
    args: [] as const
  },
  async ({ channel }) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        let src: string;
        try {
          src = await getGif();
        } catch {
          return channel.send('So sad, looks like yyyyyyy.info is down ):');
        }
        return await channel.send(src);
      } catch {
        console.log('Error sending gif, trying again');
      }
    }
  }
);
