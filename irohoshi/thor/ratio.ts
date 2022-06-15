import { join } from 'node:path';
import { MessageAttachment } from 'discord.js';
import { createCanvas, registerFont } from 'canvas';

import S3 from '$services/s3';
import { command } from '$shared/command';

const fontPath = join(__dirname, './Whitney-400.woff');
registerFont(fontPath, { family: 'Whitney', weight: '400' });

const ratios = new S3('ratios');

const numRatios = 50;
const size = 256;

export default command(
  {
    name: 'ratio',
    desc: 'Get ratioed',
    args: []
  },
  async ({ channel }) => {
    const text = generateStr();
    return channel.send(text);
  },
  [
    command(
      {
        name: 'img',
        desc: 'Get ratioed',
        args: []
      },
      async ({ channel }) => {
        const canvas = generateCanvas();
        return channel.send({
          content: null,
          files: [new MessageAttachment(canvas.toBuffer())]
        });
      }
    ),
    command(
      {
        name: 'add',
        desc: "Adds some ratios ('+' separated) to the list",
        args: [
          {
            name: 'ratios',
            type: 'string[]',
            desc: 'The ratios to add'
          }
        ]
      },
      async ({ channel }, [words]) => {
        const argStrs = words.join(' ');
        const ratioStrs = argStrs.split('+').map(s => s.trim());
        await ratios.add(...ratioStrs);
        return channel.send('Added to ratios');
      }
    )
  ]
);

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
  while (indices.size < Math.min(numRatios, ratios.data.length)) {
    indices.add(Math.floor(Math.random() * ratios.data.length));
  }
  const ratioStrings = [...indices].map(i => ratios.data[i] || '');
  return (
    ratioStrings.join(' + ') ||
    'Looks like there are no ratios, see `thor help ratio add` to find out how to add some'
  );
}
