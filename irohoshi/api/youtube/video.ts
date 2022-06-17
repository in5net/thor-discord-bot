import { yt } from './api.ts';
import { duration2Sec, extractId } from './extractors.ts';
import Thumbnail from './thumbnail.ts';

interface Video {
  id: string;
  title: string;
  description?: string;
  duration: number;
  thumbnail: Thumbnail;
  channel: {
    id: string;
    title: string;
  };
  views: number;
  likes: number;
  comments: number;
  favorites: number;
  tags: string[];
  uploadedAt: Date;
}
export default Video;

interface ListResponse {
  kind: 'youtube#videoListResponse';
  etag: string;
  items: {
    kind: 'youtube#video';
    etag: string;
    id: string;
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description?: string;
      thumbnails: {
        default: Thumbnail;
        medium: Thumbnail;
        high: Thumbnail;
        standard: Thumbnail;
        maxres: Thumbnail;
      };
      channelTitle: string;
      tags: string[];
    };
    contentDetails: {
      duration: `PT${string}`;
    };
    statistics: {
      viewCount: `${number}`;
      likeCount: `${number}`;
      favoriteCount: `${number}`;
      commentCount: `${number}`;
    };
  }[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export async function getVideo(url: string): Promise<Video> {
  const id = extractId(url);
  const response: ListResponse = await yt.videos_list({
    id,
    part: 'snippet,contentDetails,statistics'
  });
  const video = response.items?.[0];
  if (!video) throw new Error('Video not found');

  const {
    snippet: {
      title,
      description,
      tags,
      publishedAt,
      channelId,
      channelTitle,
      thumbnails: { default: thumbnail }
    },
    contentDetails: { duration },
    statistics: { viewCount, likeCount, favoriteCount, commentCount }
  } = video;
  return {
    id,
    title,
    description,
    duration: duration2Sec(duration),
    thumbnail,
    channel: {
      id: channelId,
      title: channelTitle
    },
    views: parseInt(viewCount),
    likes: parseInt(likeCount),
    comments: parseInt(commentCount),
    favorites: parseInt(favoriteCount),
    tags,
    uploadedAt: new Date(publishedAt)
  };
}
