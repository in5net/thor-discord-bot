import { parseFromString } from '../parser.ts';

const texts = new Set<string>();
const images = new Set<string>();
const gifs = new Set<string>();
const nsfw = new Set(['https://files.yyyyyyy.info/images/0071-1.gif']);

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function getText(): Promise<string> {
  if (!texts.size) {
    const response = await fetch('https://www.yyyyyyy.info/');
    const html = await response.text();
    const $ = parseFromString(html);
    const spans = $.getElementsByTagName('span');
    spans.forEach(span => {
      const text = span.textContent;
      if (text) texts.add(text);
    });
  }
  const src = random([...texts.values()]);
  texts.delete(src);
  console.log(`Text: ${src}`);
  return src;
}

export async function getImg(): Promise<string> {
  if (!images.size) {
    const response = await fetch('https://www.yyyyyyy.info/');
    const html = await response.text();
    const $ = parseFromString(html);
    const imgs = $.getElementsByTagName('img');
    imgs.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (
        src.startsWith('https://files.yyyyyyy.info/') &&
        !src.endsWith('.gif')
      )
        images.add(src);
    });
  }
  const src = random([...images.values()]);
  images.delete(src);
  console.log(`Img: ${src}`);
  return src;
}

export async function getGIF(): Promise<string> {
  if (!gifs.size) {
    const response = await fetch('https://www.yyyyyyy.info/');
    const html = await response.text();
    const $ = parseFromString(html);
    const imgs = $.getElementsByTagName('img');
    imgs.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (
        src.startsWith('https://files.yyyyyyy.info/') &&
        src.endsWith('.gif') &&
        !nsfw.has(src)
      )
        images.add(src);
    });
  }
  const src = random([...images.values()]);
  images.delete(src);
  console.log(`Img: ${src}`);
  return src;
}
