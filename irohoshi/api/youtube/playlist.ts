import Channel from './channel.ts';
import Thumbnail from './thumbnail.ts';
import Video from './video.ts';

interface Playlist {
  id: string;
  title: string;
  videoCount: number;
  lastUpdate?: string;
  views?: number;
  url: string;
  link?: string;
  channel?: Channel;
  thumbnail?: Thumbnail;
  videos: Video[];
}
export default Playlist;
