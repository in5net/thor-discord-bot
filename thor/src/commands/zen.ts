import axios from 'axios';

import type Command from './command';

const url = 'https://api.github.com/zen';

const uptime: Command = async ({ channel }) => {
  const response = await axios.get<string>(url);
  channel.send(response.data);
};

export default uptime;
