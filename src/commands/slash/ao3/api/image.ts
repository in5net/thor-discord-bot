import { type Image } from "@napi-rs/canvas";
import { type Work, symbolsOrigin } from "./work";

const imageCache = new Map<string, Image>();

export async function drawLegendarySquare({
  rating,
  category,
  warning,
  complete,
}: Work["symbols"]) {
  const { createCanvas, loadImage } = await import("@napi-rs/canvas");
  const canvas = createCanvas(56, 56);
  const ctx = canvas.getContext("2d");

  const ratingImage =
    imageCache.get(rating) ||
    (await loadImage(`${symbolsOrigin}${rating}.png`));
  const categoryImage =
    imageCache.get(category) ||
    (await loadImage(`${symbolsOrigin}${category}.png`));
  const warningImage =
    imageCache.get(warning) ||
    (await loadImage(`${symbolsOrigin}${warning}.png`));
  const completeImage =
    imageCache.get(complete) ||
    (await loadImage(`${symbolsOrigin}${complete}.png`));

  imageCache.set(rating, ratingImage);
  imageCache.set(category, categoryImage);
  imageCache.set(warning, warningImage);
  imageCache.set(complete, completeImage);

  ctx.drawImage(ratingImage, 0, 0, 25, 25);
  ctx.drawImage(categoryImage, 31, 0, 25, 25);
  ctx.drawImage(warningImage, 0, 31, 25, 25);
  ctx.drawImage(completeImage, 31, 31, 25, 25);

  return canvas;
}
