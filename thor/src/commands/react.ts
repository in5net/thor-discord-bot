import { random } from '@limitlesspc/limitless';

import emojis from '../emojis.json';
import type Command from './command';

const cmd: Command = {
  name: 'react',
  desc: 'Reacts to your message with random emojis',
  exec(message) {
    return Promise.all(
      new Array(12).fill(0).map(() => message.react(random(emojis) || ''))
    );
  }
};
export default cmd;
