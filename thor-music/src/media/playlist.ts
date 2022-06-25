import type { Prisma } from '@prisma/client';
import prisma from '$services/prisma';
import {
  FileMedia,
  MediaJSONType,
  MediaType,
  SoundCloudMedia,
  SpotifyMedia,
  URLMedia,
  YouTubeMedia
} from './media';

async function getPlaylist(uid: string, name: string) {
  const { id, songs } = await prisma.playlist.findFirst({
    where: {
      uid,
      name
    },
    select: {
      id: true,
      songs: true
    }
  });
  return { id, songs: songs as unknown as MediaJSONType[], uid, name };
}

export async function get(
  requester: {
    uid: string;
    name: string;
  },
  name: string
): Promise<MediaType[]> {
  try {
    const playlist = await getPlaylist(requester.uid, name);
    return playlist.songs.map(mediaJSON => {
      switch (mediaJSON.type) {
        case 'youtube':
          return YouTubeMedia.fromJSON(mediaJSON, requester);
        case 'spotify':
          return SpotifyMedia.fromJSON(mediaJSON, requester);
        case 'soundcloud':
          return SoundCloudMedia.fromJSON(mediaJSON, requester);
        case 'file':
          return FileMedia.fromJSON(mediaJSON, requester);
        default:
          return URLMedia.fromJSON(mediaJSON, requester);
      }
    });
  } catch {
    throw new Error('Playlist not found');
  }
}

export async function list(uid: string): Promise<string[]> {
  const playlists = await prisma.playlist.findMany({
    where: {
      uid
    },
    select: {
      name: true
    }
  });
  return playlists.map(({ name }) => name) || [];
}

export async function save(
  uid: string,
  name: string,
  medias: MediaType[]
): Promise<void> {
  const playlist = await prisma.playlist.findFirst({
    where: {
      uid,
      name
    },
    select: {
      songs: true
    },
    rejectOnNotFound: false
  });
  const songs = medias.map(media =>
    media.toJSON()
  ) as unknown as Prisma.JsonArray;
  await prisma.playlist.upsert({
    create: {
      uid,
      name,
      songs
    },
    update: {
      songs: [...(playlist?.songs as unknown as Prisma.JsonArray), ...songs]
    },
    where: {
      uid_name: {
        uid,
        name
      }
    }
  });
}

export async function add(
  requester: {
    uid: string;
    name: string;
  },
  name: string,
  medias: MediaType[]
): Promise<void> {
  const songs = medias.map(media =>
    media.toJSON()
  ) as unknown as Prisma.JsonArray;
  await prisma.playlist.upsert({
    create: {
      uid: requester.uid,
      name,
      songs
    },
    update: {
      songs
    },
    where: {
      uid_name: {
        uid: requester.uid,
        name
      }
    }
  });
}

export async function remove(
  requester: {
    uid: string;
    name: string;
  },
  name: string,
  n?: number
): Promise<void> {
  try {
    const playlist = await getPlaylist(requester.uid, name);

    if (n === undefined)
      await prisma.playlist.delete({
        where: {
          id: playlist.id
        }
      });
    else {
      playlist.songs.splice(n - 1, 1);
      await prisma.playlist.update({
        where: {
          id: playlist.id
        },
        data: {
          songs: playlist.songs as unknown as Prisma.JsonArray
        }
      });
    }
  } catch {
    throw new Error('Playlist not found');
  }
}
