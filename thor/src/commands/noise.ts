import { resolve } from 'node:path';

import { MessageAttachment } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import glsl from 'glslify';

import GL from '../gl';
import Progress from '../progress';
import type Command from './command';

const size = 512;
const scale = 100;
const frames = 24;

const cmd: Command = {
  name: 'noise',
  desc: 'Generates a image with Perlin noise',
  aliases: ['perlin', '音'],
  async exec({ channel }, args, client) {
    const text = `Generating noise...`;
    console.log(text);
    const msg = await channel.send(text);
    client.user?.setActivity(`with noise`);

    const gl = await GL.screen(
      size,
      size,
      glsl(await GL.loadFile(resolve(__dirname, './noise.frag')))
    );
    gl.uniform('scale', 'float', scale);

    let offset = Math.random() * 1000;
    let attachment: MessageAttachment;
    if (args[0] === 'gif') {
      const progress = new Progress('Generating noise', frames);
      attachment = new MessageAttachment(
        await gl.gifBuffer(frames, {
          fps: 10,
          prerender: () => {
            offset += 3;
            gl.uniform('offset', 'float', offset);
          },
          postrender: () => progress.inc()
        }),
        'noise.gif'
      );
    } else {
      gl.uniform('offset', 'float', offset);
      gl.render();
      attachment = new MessageAttachment(gl.pngBuffer(), 'noise.png');
    }

    return msg.edit({
      content: null,
      files: [attachment]
    });
  }
};
export default cmd;
