import axios from 'axios';

import type Command from './command';

const url = 'https://api.github.com/zen';

const cmd: Command = {
  name: 'zen',
  desc: 'Gets a random zen quote from https://api.github.com/zen',
  async exec({ channel }) {
    const response = await axios.get<string>(url);
    channel.send(response.data);
  }
};
export default cmd;
