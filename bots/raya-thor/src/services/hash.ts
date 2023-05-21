import { createHash } from 'node:crypto';

const size = 16;

export function strTo16x16(input: string): boolean[][] {
  const hash = createHash('sha256');
  hash.update(input);
  const digest = hash.digest('hex');

  const grid: boolean[][] = new Array(size)
    .fill(false)
    .map(() => new Array(size).fill(false));

  digest.split('').forEach((char, i) => {
    const byte = parseInt(char, 16);
    for (let j = 0; j < 4; j++) {
      const index = i * 4 + j;
      const x = index % size;
      const y = Math.floor(index / size);
      const bit = (byte >> j) & 1;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      grid[x]![y] = !!bit;
    }
  });

  return grid;
}
