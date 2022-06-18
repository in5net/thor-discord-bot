import { parseFromString } from '../parser.ts';

const FILES_ORIGIN = 'https://files.yyyyyyy.info';

const nsfw = new Set([`${FILES_ORIGIN}/images/0071-1.gif`]);

export async function getText(): Promise<string> {
  const response = await fetch('https://www.yyyyyyy.info/');
  const html = await response.text();
  const $ = await parseFromString(html);
  const spans = $.getElementsByTagName('span');
  const span = random(spans);
  const src = span.textContent;
  console.log(`Text: ${src}`);
  return src;
}

export async function getImg(): Promise<string> {
  const response = await fetch('https://www.yyyyyyy.info/');
  const html = await response.text();
  const $ = await parseFromString(html);
  const imgs = $.getElementsByTagName('img');
  const images = imgs.filter(img => {
    const src = img.getAttribute('src') || '';
    return src.startsWith(FILES_ORIGIN) && !src.endsWith('.gif');
  });
  const image = random(images);
  const src = image.getAttribute('src') || '';
  console.log(`Img: ${src}`);
  return src;
}

export async function getGIF(): Promise<string> {
  const response = await fetch('https://www.yyyyyyy.info/');
  const html = await response.text();
  const $ = await parseFromString(html);
  const imgs = $.getElementsByTagName('img');
  const images = imgs.filter(img => {
    const src = img.getAttribute('src') || '';
    return (
      src.startsWith(FILES_ORIGIN) && src.endsWith('.gif') && !nsfw.has(src)
    );
  });
  const image = random(images);
  const src = image.getAttribute('src') || '';
  console.log(`GIF: ${src}`);
  return src;
}

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
