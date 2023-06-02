/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createCanvas } from '@napi-rs/canvas';
import { AttachmentBuilder } from 'discord.js';
import ffmpeg from 'fluent-ffmpeg';
import { nanoid } from 'nanoid';
import { createReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import command from '$commands/slash';

const size = 512;

export default command(
  {
    desc: "Run Conway's Game of Life",
    options: {
      iterations: {
        type: 'int',
        desc: 'Number of iterations to run',
        min: 1,
        max: 256,
        default: 100
      },
      cell_size: {
        type: 'int',
        desc: 'Pixel size of each cell',
        min: 2,
        max: size,
        default: 8
      },
      fps: {
        type: 'int',
        desc: 'Frames per second',
        min: 1,
        max: 60,
        default: 12
      }
    }
  },
  async (i, { iterations, cell_size, fps }) => {
    await i.deferReply();

    const tmpDir = join(tmpdir(), nanoid());
    await mkdir(tmpDir);

    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    const length = size / cell_size;
    let grid = new Array(length)
      .fill(0)
      .map(() => new Array(length).fill(0).map(() => Math.random() > 0.5));

    for (let iter = 0; iter < iterations; iter++) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#fff';
      for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
          const x = i * cell_size;
          const y = j * cell_size;
          if (grid[i]?.[j]) ctx.fillRect(x, y, cell_size, cell_size);
        }
      }

      const next: boolean[][] = new Array(length)
        .fill(0)
        .map(() => new Array(length).fill(false));

      for (let x = 0; x < length; x++) {
        for (let y = 0; y < length; y++) {
          const state = grid[x]?.[y] || false;
          const neighbors = countNeighbors(x, y);

          if (!state && neighbors === 3) next[x]![y] = true;
          else if (state && (neighbors < 2 || neighbors > 3))
            next[x]![y] = false;
          else next[x]![y] = state;
        }
      }

      grid = next;

      const path = join(tmpDir, `frame${iter.toString().padStart(4, '0')}.png`);
      await writeFile(path, canvas.toBuffer('image/png'));

      await new Promise(resolve => setImmediate(resolve));
    }

    function countNeighbors(x: number, y: number) {
      let sum = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          const col = (x + i + length) % length;
          const row = (y + j + length) % length;
          if ((i || j) && grid[col]?.[row]) sum++;
        }
      }
      return sum;
    }

    await new Promise((resolve, reject) =>
      ffmpeg({ cwd: tmpDir })
        .input('frame%04d.png')
        .fps(fps)
        .videoCodec('libx264')
        .outputOptions(['-pix_fmt yuv420p'])
        .save('output.mp4')
        .once('end', resolve)
        .once('error', reject)
    );
    console.log(tmpDir);

    const outputPath = join(tmpDir, 'output.mp4');
    const stream = createReadStream(outputPath);
    stream.once('close', () => rm(tmpDir, { recursive: true }));

    console.log('Done');
    return i.editReply({
      files: [new AttachmentBuilder(stream)]
    });
  }
);
