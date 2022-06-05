import { MessageAttachment } from 'discord.js';
import { createCanvas } from 'canvas';
import { map } from '@limitlesspc/limitless';

import runner from '../equation';
import { createCommand } from '$shared/command';

const size = 512;
const ticks = 20;
const gridSize = size / ticks;

export default createCommand(
  {
    name: 'graph',
    desc: 'Makes a 2D xy graph',
    args: [
      {
        name: 'equation',
        type: 'string[]',
        desc: 'The equation to graph'
      }
    ] as const
  },
  async ({ channel }, [words], client) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    const text = `Generating graph...`;
    console.log(text);
    const msg = await channel.send(text);
    client.user?.setActivity(`with a graph`);

    function line(x1: number, y1: number, x2: number, y2: number) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = '#ccc';
    for (let i = gridSize; i < size; i += gridSize) {
      line(0, i, size, i);
      line(i, 0, i, size);
    }
    // Axes
    ctx.strokeStyle = '#000';
    line(0, size / 2, size, size / 2);
    line(size / 2, 0, size / 2, size);

    const sides = words.join(' ').split('=');
    const equation = sides[sides.length - 1] || '';
    const run = runner(equation);

    // Curve
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, size / 2);
    for (let i = 0; i < size; i++) {
      const x = map(i, 0, size, -ticks / 2, ticks / 2);
      const y = run(x);
      ctx.lineTo(i, map(y, -ticks / 2, ticks / 2, size, 0));
    }
    ctx.stroke();

    console.log('Done');
    return msg.edit({
      content: null,
      files: [new MessageAttachment(canvas.toBuffer())]
    });
  }
);
