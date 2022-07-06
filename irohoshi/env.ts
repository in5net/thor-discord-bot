import { configSync } from 'https://deno.land/std@0.147.0/dotenv/mod.ts';

configSync({
  path: new URL('../.env', import.meta.url).pathname,
  export: true
});
configSync({
  path: new URL('./.env', import.meta.url).pathname,
  export: true
});
