import assert from 'node:assert';
import test from 'node:test';

import { getRandomFile } from './shared';

test('get random file', async () => {
  const file = await getRandomFile();
  assert(file);
  console.log(file?.name);
});

test('get random image', async () => {
  const file = await getRandomFile('image');
  assert(file);
  console.log(file?.name);
});

test('get random video', async () => {
  const file = await getRandomFile('video');
  assert(file);
  console.log(file?.name);
});

test('get random audio', async () => {
  const file = await getRandomFile('audio');
  assert(file);
  console.log(file?.name);
});
