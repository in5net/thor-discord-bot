import { Client } from 'nekos-best.js';

import { incWeebCount } from '$services/users';
import type Command from './command';

const nekosBest = new Client();
const clientPromise = nekosBest.init();

const cmd: Command = {
  name: 'neko',
  desc: 'Sends a random nekos.best image',
  aliases: ['猫', 'ねこ'],
  async exec({ channel, author: { id } }) {
    const client = await clientPromise;
    const response = await client.fetchRandom('neko');
    const url = response.results[0]?.url;
    if (url) {
      await channel.send(url);
      return incWeebCount(id);
    }
    return channel.send('No neko found');
  }
};
export default cmd;
