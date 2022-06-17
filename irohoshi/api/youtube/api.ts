import { YouTube } from 'https://deno.land/x/youtube@v0.3.0/mod.ts';

export const yt = new YouTube(Deno.env.get('GOOGLE_APIS_KEY') || '', false);
