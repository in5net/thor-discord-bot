import { randomInt } from '@limitlesspc/limitless';

import { command } from '$shared/command';

export default command(
  {
    name: 'rng',
    desc: 'Generates a random number between min and max, 1 to a max, or from 1 to 10',
    args: [
      {
        name: 'min or max',
        type: 'int',
        desc: 'The minimum or maximum (no 2nd number passed) number to generate',
        optional: true
      },
      {
        name: 'max',
        type: 'int',
        desc: 'The maximum number to generate',
        optional: true
      }
    ]
  },
  async ({ channel }, [min, max]) => {
    let n: number;
    if (min === undefined) n = randomInt(10) + 1;
    else if (max === undefined) n = randomInt(min);
    else n = randomInt(min, max);
    return channel.send(n.toString());
  }
);
