import { join } from 'node:path';
import { MessageAttachment } from 'discord.js';
import { createCanvas, registerFont } from 'canvas';

import S3 from '$services/s3';
import type Command from './command';

const fontPath = join(__dirname, './Whitney-400.woff');
registerFont(fontPath, { family: 'Whitney', weight: '400' });

const ratios = new S3('ratios');

const numRatios = 50;
const size = 256;

const cmd: Command = {
  name: 'ratio',
  desc: 'Get ratioed',
  async exec({ channel }) {
    const text = generateStr();
    return channel.send(text);
  },
  subcommands: [
    {
      name: 'img',
      desc: 'Get ratioed',
      async exec({ channel }) {
        const canvas = generateCanvas();
        return channel.send({
          content: null,
          files: [new MessageAttachment(canvas.toBuffer())]
        });
      }
    },
    {
      name: 'add',
      desc: 'Adds a ratio to the list',
      usage: "<...ratios> ('+' separated)",
      async exec({ channel }, args) {
        const argStrs = args.join(' ');
        const ratioStrs = argStrs.split('+').map(s => s.trim());
        ratios.add(...ratioStrs);
        return channel.send('Added to ratios');
      }
    }
  ]
};
export default cmd;

function generateCanvas() {
  const text = generateStr();

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#dcddde';
  ctx.font = '16px Whitney';
  ctx.textBaseline = 'top';
  wrapText(ctx as CanvasRenderingContext2D, text, 0, 0, size, 24);

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = `${line + words[n]} `;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = `${words[n]} `;
      y += lineHeight;
    } else line = testLine;
  }
  ctx.fillText(line, x, y);
}

function generateStr() {
  const indices = new Set<number>();
  while (indices.size < numRatios) {
    indices.add(Math.floor(Math.random() * ratios.data.length));
  }
  const ratioStrings = [...indices].map(i => ratios.data[i] || '');
  return (
    ratioStrings.join(' + ') ||
    'Looks like there are no ratios, see `thor help ratio add` to find out how to add some'
  );
}
