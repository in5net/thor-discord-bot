import { MessageAttachment } from 'discord.js';
import { createCanvas } from 'canvas';

import type Command from './command';

const size = 16;

const cmd: Command = async ({ channel }, [hex]) => {
  if (!hex) return channel.send('You need to provide a hex code');

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  if (hex.startsWith('#')) hex = hex.slice(1);
  if (hex.length !== 6) return channel.send('Invalid hex code');

  ctx.fillStyle = `#${hex}`;
  ctx.fillRect(0, 0, size, size);

  return channel.send({
    files: [new MessageAttachment(canvas.toBuffer())]
  });
};

export default cmd;
