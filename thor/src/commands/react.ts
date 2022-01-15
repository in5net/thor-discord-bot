import { random } from '@limitlesspc/limitless';

import emojis from '../emojis.json';
import type Command from './command';

const react: Command = message =>
  Promise.all(
    new Array(12).fill(0).map(() => message.react(random(emojis) || ''))
  );

export default react;
