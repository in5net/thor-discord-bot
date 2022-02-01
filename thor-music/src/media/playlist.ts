import { mkdir, readdir, readFile, unlink, writeFile } from 'fs/promises';
import { join } from 'path';

import {
  FileMedia,
  MediaJSONType,
  MediaType,
  SoundCloudMedia,
  SpotifyMedia,
  URLMedia,
  YouTubeMedia
} from './media';

const playlistsPath = join(__dirname, '../../playlists');

const getDirPath = (uid: string) => join(playlistsPath, uid);
const getFilePath = (uid: string, name: string) =>
  join(getDirPath(uid), `${name}.json`);

export async function get(
  requester: {
    uid: string;
    name: string;
  },
  name: string
): Promise<MediaType[]> {
  const filePath = getFilePath(requester.uid, name);
  const str = await readFile(filePath, 'utf8');
  const json = JSON.parse(str) as MediaJSONType[];
  return json.map(mediaJSON => {
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
  const dirPath = getDirPath(uid);
  const files = await readdir(dirPath);
  return files.map(file => file.replace('.json', ''));
}

export async function save(
  uid: string,
  name: string,
  medias: MediaType[]
): Promise<void> {
  const dirPath = getDirPath(uid);
  await mkdir(dirPath, { recursive: true });
  const filePath = getFilePath(uid, name);
  const str = JSON.stringify(medias.map(media => media.toJSON()));
  return writeFile(filePath, str, 'utf8');
}

export async function add(
  requester: {
    uid: string;
    name: string;
  },
  name: string,
  medias: MediaType[]
): Promise<void> {
  const dirPath = getDirPath(requester.uid);
  await mkdir(dirPath, { recursive: true });
  const filePath = getFilePath(requester.uid, name);
  const currentMedias = await get(requester, name);
  const newMedias = [...currentMedias, ...medias];
  const str = JSON.stringify(newMedias.map(media => media.toJSON()));
  return writeFile(filePath, str, 'utf8');
}

export async function remove(
  requester: {
    uid: string;
    name: string;
  },
  name: string,
  n?: number
): Promise<void> {
  if (n === undefined) {
    const filePath = getFilePath(requester.uid, name);
    return unlink(filePath);
  }
  const medias = await get(requester, name);
  medias.splice(n - 1, 1);
  await save(requester.uid, name, medias);
}
