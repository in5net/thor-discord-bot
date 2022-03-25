import { createCanvas } from 'canvas';
import { MessageAttachment } from 'discord.js';

import { strTo16x16 } from '../hash';
import type Command from './command';

const size = 16;
const zoom = 4;
const width = size * zoom;

const cmd: Command = {
  name: 'hash',
  desc: 'Converts the binary of a SHA-256 hash of a message to a 16x16 image',
  usage: '<message>',
  async exec({ channel }, words) {
    const canvas = createCanvas(width, width);
    const ctx = canvas.getContext('2d');

    const input = words.join(' ');
    const grid = strTo16x16(input);

    grid.forEach((row, x) =>
      row.forEach((bit, y) => {
        ctx.fillStyle = bit ? '#fff' : '#000';
        ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
      })
    );

    return channel.send({ files: [new MessageAttachment(canvas.toBuffer())] });
  }
};
export default cmd;
