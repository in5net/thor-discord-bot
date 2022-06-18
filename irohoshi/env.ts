import { config } from 'https://deno.land/std@0.144.0/dotenv/mod.ts';

await config({
  path: new URL('../.env', import.meta.url).pathname,
  export: true
});
await config({
  path: new URL('./.env', import.meta.url).pathname,
  export: true
});
