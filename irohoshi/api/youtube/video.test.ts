import 'https://deno.land/std@0.144.0/dotenv/load.ts';

import { getVideo } from './video.ts';

Deno.test({
  name: 'youtube.video.list',
  async fn() {
    const id = 'Ks-_Mh1QhMc';
    const url = `https://www.youtube.com/watch?v=${id}`;
    const video = await getVideo(url);
    console.log(video);
  }
});
