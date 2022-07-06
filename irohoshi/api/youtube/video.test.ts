import 'https://deno.land/std@0.147.0/dotenv/load.ts';

import { getVideo, searchVideos } from './video.ts';

Deno.test('get video', async () => {
  const url = 'https://youtu.be/ZjOUc7rKtPQ';
  const video = await getVideo(url);
  console.log(video);
});

Deno.test('search video', async () => {
  const query = 'peternity';
  const videos = await searchVideos(query);
  console.log(videos);
});
