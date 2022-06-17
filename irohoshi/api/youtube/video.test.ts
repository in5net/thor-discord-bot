import 'https://deno.land/std@0.144.0/dotenv/load.ts';

import { getVideo } from './video.ts';

Deno.test('get video', async () => {
  const url = 'https://youtu.be/ZjOUc7rKtPQ';
  const video = await getVideo(url);
  console.log(video);
});
