import { MessageAttachment } from 'discord.js';
import { createCanvas } from 'canvas';

import { command } from '$shared/command';

const size = 128;

export default command(
  {
    name: 'random',
    aliases: ['ran'],
    desc: 'Generates a (literally) random image',
    args: [] as const
  },
  async ({ channel }, _, client) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    const text = `Generating a random image...`;
    console.log(text);
    const msg = await channel.send(text);
    client.user?.setActivity(`with a random image`);

    const image = ctx.createImageData(size, size);
    image.data.set(
      new Uint8ClampedArray(size * size * 4).map(() =>
        Math.floor(Math.random() * 256)
      )
    );
    ctx.putImageData(image, 0, 0);

    console.log('Done');
    return msg.edit({
      content: null,
      files: [new MessageAttachment(canvas.toBuffer())]
    });
  }
);
