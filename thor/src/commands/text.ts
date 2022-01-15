import { getText } from '../yyyyyyy.info';
import type Command from './command';

const text: Command = async ({ channel }) => {
  const src = await getText();
  await channel.send(src);
};
export default text;
