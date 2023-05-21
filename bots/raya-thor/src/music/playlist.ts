import type { Prisma } from '@prisma/client';

import prisma from '$services/prisma';
import {
  Album,
  SongJSONType,
  SongType,
  SoundCloudSong,
  SpotifySong,
  URLSong,
  YouTubeSong
} from './song';

async function getPlaylist(uid: string, name: string) {
  const { id, songs } = await prisma.playlist.findFirstOrThrow({
    select: {
      id: true,
      songs: true
    },
    where: {
      userId: uid,
      name
    }
  });
  return {
    id,
    songs: songs.map(({ title, duration, data }) => ({
      ...(data as unknown as SongJSONType),
      title,
      duration
    })),
    uid,
    name
  };
}

export async function get(
  requester: {
    uid: string;
    name: string;
  },
  name: string
): Promise<SongType[]> {
  try {
    const playlist = await getPlaylist(requester.uid, name);
    return playlist.songs.map(songJSON => {
      switch (songJSON.type) {
        case 'youtube':
          return YouTubeSong.fromJSON(songJSON, requester);
        case 'spotify':
          return SpotifySong.fromJSON(songJSON, requester);
        case 'soundcloud':
          return SoundCloudSong.fromJSON(songJSON, requester);
        default:
          return URLSong.fromJSON(songJSON, requester);
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error('Playlist not found');
  }
}

export async function list(uid: string): Promise<string[]> {
  const playlists = await prisma.playlist.findMany({
    select: {
      name: true
    },
    where: {
      userId: uid
    }
  });
  return playlists.map(({ name }) => name) || [];
}

export async function save(
  uid: string,
  name: string,
  data: (SongType | Album<YouTubeSong>)[]
) {
  const songs = data.filter(song => !('songs' in song)) as SongType[];
  const albums = data.filter(song => 'songs' in song) as Album<YouTubeSong>[];

  let playlistIndex = 0;
  const songsData = songs.map(song => {
    const { title, duration, ...data } = song.toJSON();
    return {
      title,
      duration,
      data: data as unknown as Prisma.InputJsonObject,
      playlistIndex: playlistIndex++
    };
  });
  const albumsData = albums.map(({ name, songs, ...data }) => ({
    name,
    data: data as unknown as Prisma.InputJsonObject,
    songs: {
      createMany: {
        data: songs.map(song => {
          const { title, duration, ...data } = song.toJSON();
          return {
            title,
            duration,
            data: data as unknown as Prisma.InputJsonObject,
            playlistIndex: playlistIndex++
          };
        })
      }
    }
  }));

  await prisma.album.deleteMany({
    where: {
      playlists: {
        every: {
          userId: uid,
          name
        }
      }
    }
  });
  await prisma.playlist.upsert({
    create: {
      userId: uid,
      name,
      songs: {
        createMany: {
          data: songsData
        }
      },
      albums: {
        create: albumsData
      }
    },
    update: {
      songs: {
        createMany: {
          data: songsData
        },
        deleteMany: {}
      },
      albums: {
        create: albumsData,
        deleteMany: {}
      }
    },
    where: {
      userId_name: {
        userId: uid,
        name
      }
    }
  });
}

export async function add(
  uid: string,
  name: string,
  data: (SongType | Album<YouTubeSong>)[]
) {
  const songs = data.filter(song => !('songs' in song)) as SongType[];
  const albums = data.filter(song => 'songs' in song) as Album<YouTubeSong>[];

  const aggregate = await prisma.song.aggregate({
    _max: {
      playlistIndex: true
    },
    where: {
      playlist: {
        userId: uid,
        name
      }
    }
  });
  // eslint-disable-next-line no-underscore-dangle
  let playlistIndex = aggregate._max.playlistIndex || 0;
  const songsData = songs.map(song => {
    const { title, duration, ...data } = song.toJSON();
    return {
      title,
      duration,
      data: data as unknown as Prisma.InputJsonObject,
      playlistIndex: playlistIndex++
    };
  });
  const albumsData = albums.map(({ name, songs, ...data }) => ({
    name,
    data: data as unknown as Prisma.InputJsonObject,
    songs: {
      createMany: {
        data: songs.map(song => {
          const { title, duration, ...data } = song.toJSON();
          return {
            title,
            duration,
            data: data as unknown as Prisma.InputJsonObject,
            playlistIndex: playlistIndex++
          };
        })
      }
    }
  }));

  await prisma.playlist.upsert({
    create: {
      userId: uid,
      name,
      songs: {
        createMany: {
          data: songsData
        }
      },
      albums: {
        create: albumsData
      }
    },
    update: {
      songs: {
        createMany: {
          data: songsData
        }
      },
      albums: {
        create: albumsData
      }
    },
    where: {
      userId_name: {
        userId: uid,
        name
      }
    }
  });
}

export async function remove(uid: string, name: string, n?: number) {
  try {
    if (n === undefined)
      await prisma.playlist.delete({
        where: {
          userId_name: {
            userId: uid,
            name
          }
        }
      });
    else {
      await prisma.song.deleteMany({
        where: {
          playlist: {
            userId: uid,
            name
          },
          playlistIndex: n - 1
        }
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error('Playlist not found');
  }
}
