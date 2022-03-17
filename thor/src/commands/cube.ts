import { resolve } from 'path';

import { MessageAttachment } from 'discord.js';
import { mat4 } from 'gl-matrix';

import client from '../client';
import GL from '../gl';
import { getImageUrl } from '../utils';
import Progress from '../progress';
import type Command from './command';

const size = 512;
const frames = 20;

const cmd: Command = {
  name: 'cube',
  desc: 'Makes your profile or attachment spin on a cube',
  async exec(message) {
    const text = `Generating cube...`;
    console.log(text);
    const msg = await message.channel.send(text);
    client.user?.setActivity(`with a cube`);

    const gl = new GL(size, size, true);
    await gl.createProgramFromPaths(
      resolve(__dirname, './cube.vert'),
      resolve(__dirname, './cube.frag')
    );

    gl.createVertexBuffer(GL.unitCubeTextured.vertexData);
    gl.createIndexBuffer(GL.unitCubeTextured.indexData);
    gl.attributes([
      { name: 'position', type: 'vec3' },
      { name: 'uv', type: 'vec2' }
    ]);

    const [url, isGif] = getImageUrl(message);
    await gl.createTexture(url, { isGif });

    const projectionMatrix = mat4.perspective(
      mat4.create(),
      Math.PI / 3,
      1,
      0.1,
      1000
    );
    gl.uniform('projectionMatrix', 'mat4', projectionMatrix);
    const modelViewMatrix = mat4.create();

    let angle = 0;
    const progress = new Progress('Cube', frames);
    const attachment = new MessageAttachment(
      await gl.mp4Stream(frames, resolve(__dirname, './cube.mp3'), {
        fps: 10,
        prerender: () => {
          gl.background(0, 0, 0, 1);

          mat4.identity(modelViewMatrix);
          mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5]);
          mat4.rotateX(modelViewMatrix, modelViewMatrix, angle);
          mat4.rotateY(modelViewMatrix, modelViewMatrix, angle);
          mat4.rotateZ(modelViewMatrix, modelViewMatrix, angle);
          gl.uniform('modelViewMatrix', 'mat4', modelViewMatrix);

          angle += (Math.PI * 2) / frames;
        },
        postrender: () => progress.inc()
      }),
      'cube.mp4'
    );

    return msg.edit({
      content: null,
      files: [attachment]
    });
  }
};
export default cmd;
