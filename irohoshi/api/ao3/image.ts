import {
  createCanvas,
  Image,
  loadImage
} from 'https://deno.land/x/canvas@v1.4.1/mod.ts';

import { symbolsOrigin, Work } from './work.ts';

const imageCache = new Map<string, Image>();

export async function drawLegendarySquare({
  rating,
  orientation,
  warning,
  complete
}: Work['symbols']) {
  const canvas = createCanvas(56, 56);
  const ctx = canvas.getContext('2d');

  const ratingImage =
    imageCache.get(rating) ||
    (await loadImage(`${symbolsOrigin}${rating}.png`));
  const orientationImage =
    imageCache.get(orientation) ||
    (await loadImage(`${symbolsOrigin}${orientation}.png`));
  const warningImage =
    imageCache.get(warning) ||
    (await loadImage(`${symbolsOrigin}${warning}.png`));
  const completeImage =
    imageCache.get(complete) ||
    (await loadImage(`${symbolsOrigin}${complete}.png`));

  imageCache.set(rating, ratingImage);
  imageCache.set(orientation, orientationImage);
  imageCache.set(warning, warningImage);
  imageCache.set(complete, completeImage);

  ctx.drawImage(ratingImage, 0, 0, 25, 25);
  ctx.drawImage(orientationImage, 31, 0, 25, 25);
  ctx.drawImage(warningImage, 0, 31, 25, 25);
  ctx.drawImage(completeImage, 31, 31, 25, 25);

  return canvas;
}
