import { configSync } from 'https://deno.land/std@0.144.0/dotenv/mod.ts';

console.log('ENV registering...');
configSync({
  path: new URL('../.env', import.meta.url).pathname,
  export: true
});
configSync({
  path: new URL('./.env', import.meta.url).pathname,
  export: true
});
console.log('ENV registered:', Deno.env.toObject());
