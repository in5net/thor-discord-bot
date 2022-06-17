import { yt } from './api.ts';
import { duration2Sec, extractId } from './extractors.ts';
import Thumbnail from './thumbnail.ts';

interface SearchVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail: Thumbnail;
  channel: {
    id: string;
    title: string;
  };
  tags: string[];
  uploadedAt: Date;
}

interface Video extends SearchVideo {
  duration: number;
  views: number;
  likes: number;
  comments: number;
  favorites: number;
}

interface Thumbnails {
  default: Thumbnail;
  medium: Thumbnail;
  high: Thumbnail;
  standard: Thumbnail;
  maxres: Thumbnail;
}
interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description?: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  tags?: string[];
}

interface ListResponse {
  kind: 'youtube#videoListResponse';
  items: {
    kind: 'youtube#video';
    id: string;
    snippet: VideoSnippet;
    contentDetails: { duration: `PT${string}` };
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
      tags = [],
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

interface SearchResponse {
  kind: 'youtube#searchListResponse';
  nextPageToken: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
  items: {
    kind: 'youtube#searchResult';
    id: { kind: 'youtube#video'; videoId: string };
    snippet: VideoSnippet;
  }[];
}

export async function searchVideos(
  query: string,
  maxResults = 5
): Promise<SearchVideo[]> {
  const response: SearchResponse = await yt.search_list({
    q: query,
    type: 'video',
    part: 'id,snippet',
    maxResults
  });

  return response.items.map(
    ({
      id: { videoId: id },
      snippet: {
        title,
        description,
        tags = [],
        publishedAt,
        channelId,
        channelTitle,
        thumbnails: { default: thumbnail }
      }
    }) => ({
      id,
      title,
      description,
      thumbnail,
      channel: {
        id: channelId,
        title: channelTitle
      },
      tags,
      uploadedAt: new Date(publishedAt)
    })
  );
}
