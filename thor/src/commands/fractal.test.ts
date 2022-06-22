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
  'https://cdn.discordapp.com/avatars/435129882494763069/e0b52447c565af566cd5d7e7f43bd80e.png?size=512';

(async () => {
  const buffer = await render(shapeSize, url, 1024, 1024, coords);
  await writeFile(join(__dirname, 'fractal-gl.png'), buffer);
})();
