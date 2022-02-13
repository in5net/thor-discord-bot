import { randomInt } from '@limitlesspc/limitless';

import type Command from './command';

const rng: Command = async ({ channel }, [minStr, maxStr]) => {
  let n: number;
  if (minStr === undefined) n = randomInt(1, 11);
  else {
    const min = parseInt(minStr);
    if (maxStr === undefined) {
      if (isNaN(min)) return channel.send('Max must be a number');
      n = randomInt(min);
    } else {
      if (isNaN(min)) return channel.send('Min must be a number');
      const max = parseInt(maxStr);
      if (isNaN(max)) return channel.send('Max must be a number');
      n = randomInt(min, max);
    }
  }
  return channel.send(n.toString());
};
export default rng;
