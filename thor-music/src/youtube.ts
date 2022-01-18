import { youtube } from '@googleapis/youtube';
import { extractID } from 'play-dl';

import './env';

const api = youtube({
  version: 'v3',
  auth: process.env.GOOGLE_APIS_KEY
});

export async function search(query: string): Promise<Video> {
  const searchRes = await api.search.list({
    q: query,
    type: ['video'],
    part: ['id', 'snippet'],
    maxResults: 1
  });
  const searchItem = searchRes.data.items?.[0];
  const id = searchItem?.id?.videoId || '';
  const video = await getDetails(id);
  return video;
}

export interface Video {
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  channel: Channel;
  id: string;
}
export async function getDetails(id: string): Promise<Video> {
  const videoRes = await api.videos.list({
    id: [id],
    part: ['snippet', 'contentDetails'],
    maxResults: 1
  });
  const videoItem = videoRes.data.items?.[0];
  const title = videoItem?.snippet?.title || '';
  const description = videoItem?.snippet?.description || '';
  const thumbnail = videoItem?.snippet?.thumbnails?.default?.url || '';
  let str = videoItem?.contentDetails?.duration || '';

  const channel = await getChannel(videoItem?.snippet?.channelId || '');

  console.log('YouTube duration str:', str);
  str = str?.slice(2, -1); // remove the 'PT' and 'S'
  const parts = str.split('M');

  if (parts.length === 1) {
    const [seconds = '0'] = parts;
    return {
      title,
      description,
      thumbnail,
      duration: parseInt(seconds),
      channel,
      id
    };
  }
  const [minutes = '0', seconds = '0'] = parts;
  const duration = parseInt(minutes) * 60 + parseInt(seconds);
  return {
    title,
    description,
    thumbnail,
    duration,
    channel,
    id
  };
}

export async function getPlaylist(id: string): Promise<Video[]> {
  const videos: Video[] = [];
  let nextPageToken: string | null | undefined;
  do {
    const playlistRes = await api.playlistItems.list({
      playlistId: id,
      part: ['snippet', 'contentDetails'],
      maxResults: 50,
      pageToken: nextPageToken || undefined
    });
    const pageVideos = await Promise.all(
      playlistRes.data.items?.map(async item => ({
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        thumbnail: item.snippet?.thumbnails?.default?.url || '',
        duration:
          parseInt(item.contentDetails?.endAt || '0') -
          parseInt(item.contentDetails?.startAt || '0'),
        channel: await getChannel(item.snippet?.videoOwnerChannelId || ''),
        id: item.contentDetails?.videoId || ''
      })) || []
    );
    videos.push(...pageVideos);
    console.log(playlistRes.data.items?.[0]?.contentDetails);
    ({ nextPageToken } = playlistRes.data);
  } while (nextPageToken);
  return videos;
}

export interface Channel {
  title: string;
  thumbnail: string;
  id: string;
}
export async function getChannel(id: string): Promise<Channel> {
  const channelRes = await api.channels.list({
    id: [id],
    part: ['snippet']
  });
  const channelItem = channelRes.data.items?.[0];
  const title = channelItem?.snippet?.title || '';
  const thumbnail = channelItem?.snippet?.thumbnails?.default?.url || '';
  return {
    title,
    thumbnail,
    id
  };
}

if (require.main === module) {
  (async () => {
    const url =
      'https://www.youtube.com/watch?v=lJSo28G7FK0&list=PL706D99B420CA57E6';
    const id = extractID(url);
    const videos = await getPlaylist(id);
    console.log(videos.length);
  })();
}
