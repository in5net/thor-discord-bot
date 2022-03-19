import { createReadStream, ReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

import ffmpegPath from 'ffmpeg-static';
import type { Message } from 'discord.js';

export function getImageUrl(message: Message): [url: string, isGif: boolean] {
  const attachment = message.attachments.first();
  if (attachment)
    return [attachment.url, attachment.contentType === 'image/gif'];
  return [
    message.mentions.users.first()?.displayAvatarURL({ format: 'png' }) ||
      message.author.displayAvatarURL({ format: 'png' }),
    false
  ];
}

export async function pngs2mp4(pngs: Buffer[], fps = 60): Promise<ReadStream> {
  const tmpDir = resolve(
    tmpdir(),
    `${process.env.PREFIX}${process.hrtime().join('_')}/`
  );
  await mkdir(tmpDir);

  await Promise.all(
    pngs.map((png, i) => {
      const path = resolve(tmpDir, `frame${i.toString().padStart(4, '0')}.png`);
      return writeFile(path, png);
    })
  );

  const filename = 'output.mp4';
  await new Promise(resolve =>
    exec(
      `${ffmpegPath} -framerate ${fps} -i frame%04d.png -c:v libx264 -r ${fps} -pix_fmt yuv420p ${filename}`,
      {
        cwd: tmpDir
      }
    ).once('exit', resolve)
  );
  const path = resolve(tmpDir, filename);
  return createReadStream(path);
}
