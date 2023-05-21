import { nanoid } from 'nanoid';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';

import command from '$commands/slash';
import { getBits, subtractBits } from '$services/ai/shared';
import { ADMIN_IDS } from '$services/env';
import { openai } from '$services/openai';
import { FILES_DOMAIN, filesBucket } from 'storage';
import { BITS_PRICE } from './shared';

export default command(
  {
    desc: `Create an image based on an input image using OpenAI's DALL·E 2 (costs ${BITS_PRICE} bits)`,
    options: {
      image: {
        type: 'attachment',
        desc: 'Image to make a variation of'
      },
      n: {
        type: 'int',
        desc: 'Number of images to generate',
        default: 1,
        min: 1,
        max: 4
      }
    }
  },
  async (i, { image, n }) => {
    if (i.user.bot) return i.reply('Bots cannot use DALL·E 2');
    const cost = BITS_PRICE * n;
    if (!ADMIN_IDS.includes(i.user.id)) {
      const bits = await getBits(i.user.id);
      if (bits < cost)
        return i.reply(`You need ${cost - bits} more bits to use DALL·E 2`);
    }
    if (image.size > 1024 * 1024 * 4) return i.reply('Image must be under 4MB');
    if (image.contentType !== 'image/png')
      return i.reply('Image must be a PNG');
    if (image.width !== image.height) return i.reply('Image must be square');
    await i.deferReply();

    const { body } = await fetch(image.proxyURL);
    if (!body) return i.editReply('Failed to fetch image');

    const tmpDir = join(tmpdir(), nanoid());
    await mkdir(tmpDir);
    const filePath = join(tmpDir, 'input.png');
    await body.pipeTo(Writable.toWeb(createWriteStream(filePath)));

    const {
      data: { data }
    } = await openai.createImageVariation(
      createReadStream(filePath) as unknown as File,
      1,
      '1024x1024',
      'url',
      i.user.id
    );

    const urls: string[] = [];
    for (const { url = '' } of data) {
      const { body } = await fetch(url);
      const path = `ai/${nanoid()}.png`;
      const stream = Writable.toWeb(
        filesBucket.file(path).createWriteStream({
          gzip: true,
          metadata: {
            model: 'dalle2'
          }
        })
      );
      await body?.pipeTo(stream);
      const fileURL = `https://${FILES_DOMAIN}/${path}`;
      console.log(`Uploaded ${fileURL}`);
      urls.push(fileURL);
    }

    await i.editReply({
      content: `${prompt}
${urls.join(' ')}`
    });
    await subtractBits(i.user.id, cost);
    return rm(tmpDir, { recursive: true });
  }
);
