import supabase from '$services/supabase';
import {
  FileMedia,
  MediaJSONType,
  MediaType,
  SoundCloudMedia,
  SpotifyMedia,
  URLMedia,
  YouTubeMedia
} from './media';
import type { definitions } from '../../../types/supabase';

type Def = definitions['playlists'];
interface Playlist extends Def {
  songs: MediaJSONType[];
}

const playlistsTable = supabase.from<Playlist>('playlists');

async function getPlaylist(
  uid: string,
  name: string
): Promise<Playlist | null> {
  const { data: playlist } = await playlistsTable
    .select('id,songs')
    .match({
      uid,
      name
    })
    .single();
  return playlist && { ...playlist, uid, name };
}

export async function get(
  requester: {
    uid: string;
    name: string;
  },
  name: string
): Promise<MediaType[]> {
  const playlist = await getPlaylist(requester.uid, name);
  if (!playlist) throw new Error('Playlist not found');

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
}

export async function list(uid: string): Promise<string[]> {
  const { data: playlists } = await playlistsTable
    .select('name')
    .eq('uid', uid);
  return playlists?.map(({ name }) => name) || [];
}

export async function save(
  uid: string,
  name: string,
  medias: MediaType[]
): Promise<void> {
  const songs = medias.map(media => media.toJSON());
  await playlistsTable.upsert({
    uid,
    name,
    songs
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
  const songs = medias.map(media => media.toJSON());
  await playlistsTable.upsert({
    uid: requester.uid,
    name,
    songs
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
  const playlist = await getPlaylist(requester.uid, name);
  if (!playlist) return;

  if (n === undefined) await playlistsTable.delete().eq('id', playlist.id);
  else {
    playlist.songs.splice(n - 1, 1);
    await playlistsTable.update({
      id: playlist.id,
      songs: playlist.songs
    });
  }
}
