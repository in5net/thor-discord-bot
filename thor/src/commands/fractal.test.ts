import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';

import { render } from './fractal';

const shapeSize = 2;
const coords: [x: number, y: number][] = [
  [0, 0],
  [1, 0],
  [0, 1]
];
const url =
  'https://cdn.discordapp.com/attachments/769209668705845308/989251745316229140/Archive_of_Our_Own_logo.png';

(async () => {
  const buffer = await render(shapeSize, url, 351, 240, coords);
  await writeFile(join(__dirname, 'fractal-gl.png'), buffer);
})();
