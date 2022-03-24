import { random } from '@limitlesspc/limitless';
import decodeGif from 'decode-gif';
import axios from 'axios';
import { load } from 'cheerio';

const texts = new Set<string>();
const images = new Set<string>();
const gifs = new Set<string>();
const nsfw = new Set(['https://files.yyyyyyy.info/images/0071-1.gif']);

export async function getText(): Promise<string> {
  if (!texts.size) {
    const response = await axios('https://www.yyyyyyy.info/');
    const $ = load(response.data);
    const spans = $('span');
    spans.each((_, span) => {
      const text = $(span).text();
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
    const response = await axios('https://www.yyyyyyy.info/');
    const $ = load(response.data);
    const imgs = $('img');
    imgs.each((_, img) => {
      const src = $(img).attr('src') || '';
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

export async function getGif(): Promise<string> {
  let src = '';
  while (!src) {
    if (!gifs.size) await getGIFs();
    const url = random([...gifs.values()]);
    const response = await axios(url, { responseType: 'arraybuffer' });
    const buffer = response.data;
    const frames = decodeGif(buffer).frames.length;
    if (frames > 1) src = url;
    gifs.delete(src);
  }
  console.log(`GIF: ${src}`);
  return src;
}

async function getGIFs(): Promise<void> {
  console.log('Getting GIFs...');
  const response = await axios('https://www.yyyyyyy.info/');
  const $ = load(response.data);
  const imgs = $('img');
  imgs.each((_, img) => {
    const src = $(img).attr('src') || '';
    if (
      src.startsWith('https://files.yyyyyyy.info/') &&
      src.endsWith('.gif') &&
      !nsfw.has(src)
    )
      gifs.add(src);
  });
  console.log(`Got ${gifs.size} GIFs`);
}
