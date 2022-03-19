import { pause, random } from '@limitlesspc/limitless';

import type Command from './command';

const cmd: Command = {
  name: 'ping',
  desc: 'Ping a user a certain number of times with a message at random intervals',
  usage: '<@user> <times> <msg>',
  async exec({ channel, mentions }, [, timesStr, ...msg]) {
    const user = mentions.users?.first();
    if (!user) return channel.send('No user mentioned');
    if (!timesStr) return channel.send('No number of times specified');
    const times = parseInt(timesStr);
    if (isNaN(times) || times < 1)
      return channel.send('Invalid number of times');
    if (times > 10) return channel.send('Number of times must be less than 10');

    for (let i = 0; i < times; i++) {
      await pause(random(1000, 5000));
      await channel.send(`<@${user.id}> ${msg.join(' ')}`);
    }
    return Promise.resolve();
  }
};
export default cmd;
