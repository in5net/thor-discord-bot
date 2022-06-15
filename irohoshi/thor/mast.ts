import axios from 'axios';
import { load } from 'cheerio';

import { command } from '$shared/command';

export default command(
  {
    name: 'mast',
    desc: 'Tells you if the U.S. flag is at half or full mast today',
    args: []
  },
  async ({ channel }) => {
    const response = await axios('https://halfstaff.org');
    const $ = load(response.data);
    const element = $('#text-center > div > strong > br:nth-child(3)');
    const text = element.text();
    return channel.send(
      `The U.S. flag is at ${
        text.includes('half staff') ? 'half' : 'full'
      } mast today`
    );
  }
);
