import axios from 'axios';

import { incWeebCount } from '$services/users';
import type Command from './command';

const cmd: Command = {
  name: 'catboy',
  desc: 'Sends a random catboys.com image',
  async exec({ channel, author: { id } }) {
    const response = await axios.get<{ url: string }>(
      'https://api.catboys.com/img'
    );
    await channel.send(response.data.url);
    return incWeebCount(id);
  }
};
export default cmd;
