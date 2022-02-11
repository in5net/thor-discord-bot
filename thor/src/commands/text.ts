import { getText } from '../yyyyyyy.info';
import type Command from './command';

const text: Command = async ({ channel }) => {
  const src = await getText();
  try {
    return channel.send(src);
  } catch {
    return channel.send('So sad, looks like yyyyyyy.info is down ):');
  }
};
export default text;
