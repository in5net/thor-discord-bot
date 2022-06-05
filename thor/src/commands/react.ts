import { random } from '@limitlesspc/limitless';

import emojis from '../emojis.json';
import { command } from '$shared/command';

export default command(
  {
    name: 'react',
    desc: 'Reacts to your message with random emojis',
    args: [] as const
  },
  message =>
    Promise.all(new Array(12).fill(0).map(() => message.react(random(emojis))))
);
