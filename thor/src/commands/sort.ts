import { MessageAttachment } from 'discord.js';
import { createCanvas } from 'canvas';
import {
  bubble,
  clamp,
  cocktail,
  comb,
  cycle,
  gnome,
  heap,
  insertion,
  map,
  max,
  merge,
  pause,
  quick,
  selection,
  shell,
  shuffle
} from '@limitlesspc/limitless';

import { pngs2mp4 } from '../utils';
import { command } from '$shared/command';

const size = 512;

export default command(
  {
    name: 'sort',
    desc: 'Sorts a random array of numbers',
    args: [
      {
        name: 'algorithm',
        type: 'string',
        desc: 'The algorithm to use',
        default: 'quick'
      },
      {
        name: 'length',
        type: 'int',
        desc: 'The length of the array to sort',
        default: 50
      }
    ] as const
  },
  async ({ channel }, [algorithm, len], client) => {
    const text = 'Sorting...';
    client.user?.setActivity(text);
    const msg = await channel.send(text);

    const length = clamp(len, 0, 250);
    const randomNumberArr = shuffle(
      new Array(length).fill(0).map((_, i) => i + 1)
    );
    const m = max(randomNumberArr);
    let iter: Generator<number[]>;

    const compare = (a: number, b: number) => a - b;
    switch (algorithm) {
      case 'bubble':
        iter = bubble(randomNumberArr, compare);
        break;
      case 'cocktail':
        iter = cocktail(randomNumberArr, compare);
        break;
      case 'selection':
        iter = selection(randomNumberArr, compare);
        break;
      case 'insertion':
        iter = insertion(randomNumberArr, compare);
        break;
      case 'shell':
        iter = shell(randomNumberArr, compare);
        break;
      case 'merge':
        iter = merge(randomNumberArr, compare);
        break;
      case 'heap':
        iter = heap(randomNumberArr, compare);
        break;
      case 'comb':
        iter = comb(randomNumberArr, compare);
        break;
      case 'gnome':
        iter = gnome(randomNumberArr, compare);
        break;
      case 'cycle':
        iter = cycle(randomNumberArr, compare);
        break;
      default:
        iter = quick(randomNumberArr, compare);
        algorithm = 'quick';
    }

    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    const pngs: Buffer[] = [];

    let next: IteratorResult<number[]>;
    let active: number[] = [];
    do {
      next = iter.next();
      active = next.value || [];
      render();
      // eslint-disable-next-line no-await-in-loop
      await pause(0);
    } while (!next.done);

    function render() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, size, size);

      const w = canvas.width / randomNumberArr.length;
      randomNumberArr.forEach((n, i) => {
        if (active.includes(i)) ctx.fillStyle = '#f00';
        else ctx.fillStyle = '#fff';
        ctx.fillRect(
          i * w,
          map(n, 0, m, canvas.height, 0),
          w,
          map(n, 0, m, 0, canvas.height)
        );
      });

      pngs.push(canvas.toBuffer());
    }

    const attachment = new MessageAttachment(
      await pngs2mp4(pngs),
      `${name}_sort_${length}.mp4`
    );
    return msg.edit({ content: null, files: [attachment] });
  }
);
