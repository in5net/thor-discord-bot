import axios from 'axios';

import { command } from '$shared/command';

const url = 'https://api.github.com/zen';

export default command(
  {
    name: 'zen',
    desc: 'Gets a random zen quote from https://api.github.com/zen',
    args: [] as const
  },
  async ({ channel }) => {
    const response = await axios.get<string>(url);
    channel.send(response.data);
  }
);
