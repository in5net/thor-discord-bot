/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { resolve } from 'node:path';

import { MessageAttachment } from 'discord.js';
import { randomInt } from '@limitlesspc/limitless';

import client from '../client';
import GL from '../gl';
import { getImageUrl } from '../utils';
import type Command from './command';

const pixels = 512;
const iterations = 32;

const cmd: Command = {
  name: 'fractal',
  desc: 'Generates a random fractal image',
  async exec(message) {
    const shapeSize = Math.random() < 0.01 ? 10 : randomInt(2, 6);
    const sizeText = `${shapeSize}x${shapeSize}`;
    const text = `Generating a ${sizeText} fractal...`;
    console.log(text);
    const msg = await message.channel.send(text);
    client.user?.setActivity(`with a ${sizeText} fractal`);

    const coords: [x: number, y: number][] = [];
    while (!coords.length) {
      for (let x = 0; x < shapeSize; x++) {
        for (let y = 0; y < shapeSize; y++) {
          if (Math.random() < 0.5) coords.push([x, y]);
        }
      }
    }

    const fragmentSource = await GL.loadFile(
      resolve(__dirname, './fractal.frag')
    );
    const gl = await GL.screen(
      pixels,
      pixels,
      fragmentSource
        .replaceAll(
          '#define COORDS_LENGTH 1',
          `#define COORDS_LENGTH ${coords.length.toString()}`
        )
        .replaceAll(
          '#define ITERATIONS 1',
          `#define ITERATIONS ${iterations.toString()}`
        )
    );

    gl.uniform('resolution', 'vec2', [pixels, pixels]);
    gl.uniform('size', 'int', shapeSize);
    gl.uniform('coords', 'ivec2[]', coords);

    await gl.createTexture(getImageUrl(message)[0], { param: gl.gl.REPEAT });

    gl.render();
    console.log('Done');

    return msg.edit({
      content: null,
      files: [new MessageAttachment(gl.pngBuffer(), 'fractal.png')]
    });
  }
};
export default cmd;
