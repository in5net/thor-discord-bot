import { join } from 'node:path';
import { MessageAttachment } from 'discord.js';
import { createCanvas, registerFont } from 'canvas';

import { createWriteStream } from 'node:fs';
import type Command from './command';

const fontPath = join(__dirname, './Whitney-400.woff');
registerFont(fontPath, { family: 'Whitney', weight: '400' });

const ratios = [
  'L',
  'ratio',
  'get gud',
  'cry abt it',
  'ur mom',
  "didn't ask",
  'get real',
  'minecraft > fortnite',
  'i know ur ip',
  'get got',
  "don't care",
  'stay mad',
  'cope harder',
  'hoes mad',
  'skill issue',
  'basic',
  'audacity',
  'try harder',
  'any askers',
  'triggered',
  'twitter user',
  'discord mod',
  'based',
  'cringe',
  'touch grass',
  'gg ez',
  'ok and?',
  'get a life',
  'professional loser',
  'reported',
  'your problem',
  'straight cash',
  'no friends',
  'done for',
  'rip bozo',
  'league player',
  'no bitches?',
  'ask deez',
  'irrelevant',
  'where?',
  'problematic',
  'go ahead and whine',
  'redpilled',
  'you fell off',
  'ez clap',
  'mad free',
  'counter ratio',
  'final ratio',
  "didn't ask again",
  'counter-counter ratio',
  'spell check',
  'grammar mistake',
  'baby dragon user',
  'too easy',
  'wahh',
  'look at ur face',
  'jealous',
  'cancelled',
  'banned',
  'kicked',
  'lol',
  'lmao',
  'glhf',
  'stay pressed',
  'addressed leaked',
  'dad works for fbi',
  'can hack',
  'netflix & chill',
  "can't win",
  'ur done',
  "can't recover",
  'xoxo',
  'rekt',
  'still in 2010',
  "can't fathom",
  'opinion'
];
const numRatios = 50;
const size = 256;

const ratio: Command = async ({ channel }, [arg]) => {
  if (arg === 'img') {
    const canvas = generateCanvas();
    return channel.send({
      content: null,
      files: [new MessageAttachment(canvas.toBuffer())]
    });
  }
  const text = generateStr();
  return channel.send(text);
};

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
    indices.add(Math.floor(Math.random() * ratios.length));
  }
  const ratioStrings = [...indices].map(i => ratios[i] || '');
  return ratioStrings.join(' + ');
}

if (require.main === module) {
  console.log('Running as a standalone script');
  const imgPath = join(__dirname, './ratio.png');
  generateCanvas().createPNGStream().pipe(createWriteStream(imgPath));
}

export default ratio;
