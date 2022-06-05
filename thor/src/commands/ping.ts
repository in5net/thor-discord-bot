import { pause, random } from '@limitlesspc/limitless';

import { command } from '$shared/command';

export default command(
  {
    name: 'ping',
    desc: 'Ping a user a certain number of times with a message at random intervals',
    args: [
      {
        name: '@user',
        type: 'mention',
        desc: 'The user to ping'
      },
      {
        name: 'times',
        type: 'int',
        desc: 'The number of times to ping the user'
      },
      {
        name: 'message',
        type: 'string[]',
        desc: 'The message to ping'
      }
    ] as const
  },
  async ({ channel }, [user, times, message]) => {
    if (isNaN(times) || times < 1)
      return channel.send('Invalid number of times');
    if (times > 10) return channel.send('Number of times must be less than 10');

    for (let i = 0; i < times; i++) {
      await pause(random(1000, 5000));
      await channel.send(`<@${user.id}> ${message.join(' ')}`);
    }
    return Promise.resolve();
  }
);
