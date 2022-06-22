/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { resolve } from 'node:path';

import { MessageAttachment } from 'discord.js';
import { randomInt } from '@limitlesspc/limitless';

import GL from '../gl';
import { getImage } from '../utils';
import { command } from '$shared/command';

const iterations = 32;

export default command(
  {
    name: 'fractal',
    desc: 'Generates a random fractal image',
    args: [] as const
  },
  async (message, _, client) => {
    const shapeSize = randomInt(2, 6);
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

    const { url, width, height } = getImage(message);

    const buffer = await render(shapeSize, url, width, height, coords);
    console.log('Done');

    return msg.edit({
      content: null,
      files: [new MessageAttachment(buffer, 'fractal.png')]
    });
  }
);

export async function render(
  shapeSize: number,
  url: string,
  width: number,
  height: number,
  coords: [x: number, y: number][]
): Promise<Buffer> {
  console.log(url, width, height);
  const fragmentSource = await GL.loadFile(
    resolve(__dirname, './fractal.frag')
  );
  const gl = await GL.screen(
    width * shapeSize,
    height * shapeSize,
    fragmentSource.replaceAll(
      '#define COORDS_LENGTH 1',
      `#define COORDS_LENGTH ${coords.length.toString()}`
    )
  );

  gl.uniform('iterations', 'int', iterations);
  gl.uniform('size', 'float', shapeSize);
  gl.uniform('coords', 'ivec2[]', coords);

  await gl.createTexture(url, { param: gl.gl.REPEAT });

  gl.render();

  return gl.pngBuffer();
}
