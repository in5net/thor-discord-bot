import { random } from '@in5net/limitless';

import command from '$commands/slash';

export default command(
  {
    desc: 'Flip a coin',
    options: {}
  },
  i => i.reply(random(['Heads', 'Tails']))
);
