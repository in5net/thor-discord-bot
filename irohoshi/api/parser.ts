import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.30-alpha/deno-dom-wasm.ts';

const parser = new DOMParser();
export const parseFromString = (source: string) =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  parser.parseFromString(source, 'text/html')!;
