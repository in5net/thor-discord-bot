import axios from 'axios';
import { JSDOM } from 'jsdom';

import type Command from './command';

const cmd: Command = {
  name: 'mast',
  desc: 'Tells you if the U.S. flag is at half or full mast today',
  async exec({ channel }) {
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
  }
};
export default cmd;
