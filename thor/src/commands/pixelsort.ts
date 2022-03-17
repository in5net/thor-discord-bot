/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MessageAttachment } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';

import client from '../client';
import { getImageUrl } from '../utils';
import type Command from './command';

const cmd: Command = {
  name: 'pixelsort',
  desc: 'Sorts the pixels in an image',
  async exec(message) {
    const text = 'Sorting image...';
    console.log(text);
    const msg = await message.channel.send(text);
    client.user?.setActivity(`with pixels`);

    const url = getImageUrl(message)[0];
    const image = await loadImage(url);
    const { width, height } = image;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;
    type Color = [r: number, g: number, b: number, a: number];
    const colors: Color[] = new Array(width * height);
    for (let i = 0; i < width * height; i++) {
      colors[i] = [
        data[i * 4 + 0]!,
        data[i * 4 + 1]!,
        data[i * 4 + 2]!,
        data[i * 4 + 3]!
      ];
    }
    colors.sort((a, b) => {
      const aSum = a[0] + a[1] + a[2] + a[3];
      const bSum = b[0] + b[1] + b[2] + b[3];
      return aSum - bSum;
    });
    imageData.data.set(colors.flat());
    ctx.putImageData(imageData, 0, 0);

    console.log('Done');
    return msg.edit({
      content: null,
      files: [new MessageAttachment(canvas.toBuffer())]
    });
  }
};
export default cmd;
