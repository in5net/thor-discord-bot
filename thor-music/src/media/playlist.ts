import { FieldValue } from 'firebase-admin/firestore';

import { db } from '$services/firebase';
import {
  FileMedia,
  MediaJSONType,
  MediaType,
  SoundCloudMedia,
  SpotifyMedia,
  URLMedia,
  YouTubeMedia
} from './media';

interface Playlist {
  owner: string; // uid
  name: string;
  songs: MediaJSONType[];
}

const playlistsRef = db.collection(
  'playlists'
) as FirebaseFirestore.CollectionReference<Playlist>;

async function getPlaylist(
  uid: string,
  name: string
): Promise<(Playlist & { id: string }) | undefined> {
  const queryRef = playlistsRef
    .where('owner', '==', uid)
    .where('name', '==', name)
    .limit(1);
  const snapshot = await queryRef.get();
  const doc = snapshot.docs[0];
  return doc && { ...doc.data(), id: doc.id };
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
  const queryRef = playlistsRef.where('owner', '==', uid);
  const snapshot = await queryRef.get();
  const names = snapshot.docs.map(doc => doc.data().name);
  return names;
}

export async function save(
  uid: string,
  name: string,
  medias: MediaType[]
): Promise<void> {
  const playlist = await getPlaylist(uid, name);
  const songs = medias.map(media => media.toJSON());
  if (playlist) {
    const playlistRef = playlistsRef.doc(playlist.id);
    await playlistRef.update('songs', songs);
  } else
    await playlistsRef.add({
      owner: uid,
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
  const playlist = await getPlaylist(requester.uid, name);
  const songs = medias.map(media => media.toJSON());
  if (playlist) {
    const playlistRef = playlistsRef.doc(playlist.id);
    await playlistRef.update('songs', FieldValue.arrayUnion(...songs));
  } else
    await playlistsRef.add({
      owner: requester.uid,
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

  const playlistRef = playlistsRef.doc(playlist.id);

  if (n === undefined) await playlistRef.delete();
  else {
    playlist.songs.splice(n - 1, 1);
    await playlistRef.update('songs', playlist.songs);
  }
}
