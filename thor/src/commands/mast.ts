import axios from 'axios';
import { JSDOM } from 'jsdom';

import type Command from './command';

const mast: Command = async ({ channel }) => {
  const response = await axios('https://halfstaff.org');
  const dom = new JSDOM(response.data);
  const element = dom.window.document.querySelector(
    '#text-center > div > strong > br:nth-child(3)'
  );
  const text = element?.textContent || '';
  return channel.send(
    `The U.S. flag is at ${
      text.includes('half staff') ? 'half' : 'full'
    } mast today`
  );
};

export default mast;
