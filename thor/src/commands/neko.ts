import { Client } from 'nekos-best.js';

import type Command from './command';

const nekosBest = new Client();
const clientPromise = nekosBest.init();

const cmd: Command = {
  name: 'neko',
  desc: 'Sends a random nekos.best image',
  async exec({ channel }) {
    const client = await clientPromise;
    const response = await client.fetchRandom('neko');
    const url = response.results[0]?.url;
    if (url) return channel.send(url);
    return channel.send('No neko found');
  }
};
export default cmd;
