import {
  DOMParser,
  initParser
} from 'https://deno.land/x/deno_dom@v0.1.31-alpha/deno-dom-wasm-noinit.ts';

export async function parseFromString(source: string) {
  await initParser();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return new DOMParser().parseFromString(source, 'text/html')!;
}
