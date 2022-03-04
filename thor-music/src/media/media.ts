import { MessageEmbed } from 'discord.js';
import play from 'play-dl';
import chalk from 'chalk';
import type {
  SoundCloudPlaylist,
  SoundCloudTrack,
  SpotifyAlbum,
  SpotifyPlaylist,
  SpotifyTrack
} from 'play-dl';

import { Channel, getDetails, search } from '../youtube';

interface MediaJSON {
  title: string;
  duration: number; // seconds
}
abstract class Media {
  constructor(
    public title: string,
    public duration: number, // seconds
    public requester: {
      uid: string;
      name: string;
    }
  ) {}

  abstract iconURL: string;

  abstract log(): void;

  abstract toString(): string;

  abstract toJSON(): MediaJSON;

  getEmbed(): MessageEmbed {
    const { title, requester, iconURL } = this;
    return new MessageEmbed().setTitle(title).setFooter({
      text: `Requested by ${requester.name}`,
      iconURL
    });
  }
}

interface YouTubeJSON extends MediaJSON {
  type: 'youtube';
  id: string;
  time?: number;
  description: string;
  thumbnail: string;
  channel: Channel;
}
export class YouTubeMedia extends Media {
  constructor(
    public id: string,
    public description: string,
    public thumbnail: string,
    public channel: Channel,
    title: string,
    duration: number,
    requester: {
      uid: string;
      name: string;
    },
    public time?: number
  ) {
    super(title, duration, requester);
  }

  get iconURL() {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png';
  }

  get url(): string {
    return `https://www.youtube.com/watch?v=${this.id}${
      this.time ? `&t=${this.time}` : ''
    }`;
  }

  get channelURL(): string {
    return `https://www.youtube.com/channel/${this.channel.id}`;
  }

  log() {
    const { title, channel, url } = this;
    console.log(chalk`📺 {red [You{white Tube}]}
${title} (${url})
* channel: ${channel.title}`);
  }

  toString(): string {
    return `📺 [YouTube] ${this.title} (${this.url})`;
  }

  toJSON(): YouTubeJSON {
    const { id, time, description, thumbnail, channel, title, duration } = this;
    return {
      type: 'youtube',
      id,
      time,
      description,
      thumbnail,
      channel,
      title,
      duration
    };
  }
  static fromJSON(
    { id, time, description, thumbnail, channel, title, duration }: YouTubeJSON,
    requester: {
      uid: string;
      name: string;
    }
  ): YouTubeMedia {
    return new YouTubeMedia(
      id,
      description,
      thumbnail,
      channel,
      title,
      duration,
      requester,
      time
    );
  }

  getEmbed() {
    const { description, thumbnail, channel, url, channelURL } = this;
    return super
      .getEmbed()
      .setColor('RED')
      .setURL(url)
      .setDescription(
        description.length > 1000
          ? `${description.slice(0, 1000)}...`
          : description
      )
      .setThumbnail(thumbnail)
      .setAuthor({
        name: channel.title,
        url: channelURL,
        iconURL: channel.thumbnail
      });
  }

  static async fromId(
    id: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<YouTubeMedia> {
    try {
      const { title, description, thumbnail, duration, channel } =
        await getDetails(id);
      return new YouTubeMedia(
        id,
        description,
        thumbnail,
        channel,
        title,
        duration,
        requester
      );
    } catch {
      try {
        const {
          video_details: {
            id: videoId = '',
            title = '',
            description = '',
            durationInSec: duration,
            thumbnails: [thumbnail],
            channel
          }
        } = await play.video_basic_info(id);
        return new YouTubeMedia(
          videoId,
          description,
          thumbnail?.url || '',
          {
            id: channel?.id || '',
            title: channel?.name || '',
            thumbnail: channel?.iconURL() || ''
          },
          title,
          duration,
          requester
        );
      } catch {
        return new YouTubeMedia(
          id,
          '',
          '',
          {
            id: '',
            title: '',
            thumbnail: ''
          },
          '',
          NaN,
          requester
        );
      }
    }
  }

  static async fromURL(
    url: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<YouTubeMedia> {
    const id = play.extractID(url);
    const media = await this.fromId(id, requester);
    const timeRegex = /\?t=(\d+)/;
    const matches = url.match(timeRegex) || [];
    if (matches[1]) media.time = parseInt(matches[1]);
    return media;
  }

  static async fromSearch(
    query: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<YouTubeMedia> {
    try {
      const { title, description, thumbnail, duration, channel, id } =
        await search(query);
      return new YouTubeMedia(
        id,
        description,
        thumbnail,
        channel,
        title,
        duration,
        requester
      );
    } catch {
      const [video] = await play.search(query, { limit: 1 });
      if (!video) return Promise.reject();
      const {
        id: videoId = '',
        title = '',
        description = '',
        durationInSec: duration,
        thumbnails: [thumbnail],
        channel
      } = video;
      return new YouTubeMedia(
        videoId,
        description,
        thumbnail?.url || '',
        {
          id: channel?.id || '',
          title: channel?.name || '',
          thumbnail: channel?.iconURL() || ''
        },
        title,
        duration,
        requester
      );
    }
  }

  static async fromPlaylistId(
    id: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<YouTubeMedia[]> {
    const playlist = await play.playlist_info(id);
    const videos = await playlist.all_videos();
    return videos.map(
      ({
        id: videoId = '',
        title = '',
        description = '',
        durationInSec: duration,
        thumbnails: [thumbnail],
        channel
      }) =>
        new YouTubeMedia(
          videoId,
          description,
          thumbnail?.url || '',
          {
            id: channel?.id || '',
            title: channel?.name || '',
            thumbnail: channel?.iconURL() || ''
          },
          title,
          duration,
          requester
        )
    );
  }
}

const SPOTIFY_SONG =
  /^(https:\/\/)?(open\.spotify\.com\/track\/)([0-9A-Za-z_-]{22}).*$/;
interface SpotifyJSON extends MediaJSON {
  type: 'spotify';
  id: string;
  ytId: string;
  artist: {
    name: string;
    id: string;
  };
  thumbnail?: string;
  album?: {
    name: string;
    id: string;
  };
}
export class SpotifyMedia extends Media {
  constructor(
    public id: string,
    public ytId: string,
    public artist: {
      name: string;
      id: string;
    },
    title: string,
    duration: number,
    requester: {
      uid: string;
      name: string;
    },
    public thumbnail?: string,
    public album?: {
      name: string;
      id: string;
    }
  ) {
    super(title, duration, requester);
  }

  get iconURL() {
    return 'https://cdn-icons-png.flaticon.com/512/2111/2111624.png';
  }

  static id2URL(id: string): string {
    return `https://open.spotify.com/track/${id}`;
  }

  static url2Id(url: string): string {
    return url.match(SPOTIFY_SONG)?.[3] || '';
  }

  get url(): string {
    return SpotifyMedia.id2URL(this.id);
  }

  get artistURL(): string {
    return `https://open.spotify.com/artist/${this.artist.id}`;
  }

  get albumURL(): string {
    const { album } = this;
    return album ? `https://open.spotify.com/album/${album.id}` : '';
  }

  get youtubeURL(): string {
    return `https://www.youtube.com/watch?v=${this.ytId}`;
  }

  log() {
    const { title, artist, album, url, artistURL, albumURL, youtubeURL } = this;
    console.log(chalk`🟢 {green [Spotify]}
${title} (${url})
* {red you{white tube}} url: ${youtubeURL}
* artist: ${artist.name} (${artistURL})${
      album
        ? `
* album: ${album.name} (${albumURL})`
        : ''
    }`);
  }

  toString(): string {
    return `🟢 [Spotify] ${this.title} (${this.url})`;
  }

  toJSON(): SpotifyJSON {
    const { id, ytId, artist, title, duration, thumbnail, album } = this;
    return {
      type: 'spotify',
      id,
      ytId,
      artist,
      title,
      duration,
      thumbnail,
      album
    };
  }
  static fromJSON(
    { id, ytId, artist, title, duration, thumbnail, album }: SpotifyJSON,
    requester: {
      uid: string;
      name: string;
    }
  ): SpotifyMedia {
    return new SpotifyMedia(
      id,
      ytId,
      artist,
      title,
      duration,
      requester,
      thumbnail,
      album
    );
  }

  getEmbed() {
    const { thumbnail, artist, album, url, artistURL, albumURL } = this;
    const embed = super.getEmbed().setColor('GREEN').setURL(url).setAuthor({
      name: artist.name,
      url: artistURL
    });
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (album) embed.addField('Album', `[${album.name}](${albumURL})`);
    return embed;
  }

  static async fromURL(
    url: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<SpotifyMedia> {
    if (play.sp_validate(url) !== 'track') return Promise.reject();

    const {
      name,
      durationInSec: duration,
      thumbnail,
      artists: [artist],
      album
    } = (await play.spotify(url)) as SpotifyTrack;
    let ytId = '';
    try {
      const video = await search(`${name} ${artist?.name || ''}`);
      ytId = video.id;
    } catch {
      const [video] = await play.search(`${name} ${artist?.name || ''}`, {
        limit: 1
      });
      if (!video?.id) return Promise.reject();
      ytId = video.id;
    }
    return new SpotifyMedia(
      SpotifyMedia.url2Id(url),
      ytId,
      {
        name: artist?.name || '',
        id: artist?.id || ''
      },
      name,
      duration,
      requester,
      thumbnail?.url,
      album && {
        name: album.name,
        id: album.id
      }
    );
  }

  static fromId(
    id: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<SpotifyMedia> {
    const url = SpotifyMedia.id2URL(id);
    return this.fromURL(url, requester);
  }

  static async fromListURL(
    url: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<SpotifyMedia[]> {
    const type = play.sp_validate(url);
    if (type !== 'album' && type !== 'playlist') return Promise.reject();

    const spotify = (await play.spotify(url)) as SpotifyAlbum | SpotifyPlaylist;
    const tracks = await spotify.all_tracks();
    return Promise.all(
      tracks.map(track => SpotifyMedia.fromId(track.id, requester))
    );
  }
}

interface SoundCloudJSON extends MediaJSON {
  type: 'soundcloud';
  url: string;
  user: {
    id: string;
    name: string;
    url: string;
  };
  thumbnail: string;
}
export class SoundCloudMedia extends Media {
  constructor(
    public url: string,
    public user: {
      id: string;
      name: string;
      url: string;
    },
    public thumbnail: string,
    title: string,
    duration: number,
    requester: {
      uid: string;
      name: string;
    }
  ) {
    super(title, duration, requester);
  }

  get iconURL() {
    return 'https://mpng.subpng.com/20190609/ibv/kisspng-logo-font-brand-clip-art-trademark-francesco-tristano-contact-5cfda0624d6629.175959541560125538317.jpg';
  }

  log() {
    const { title, url, user } = this;
    console.log(chalk`☁️ {orange [SoundCloud]}
${title} (${url})
* user: ${user.name} (${user.url})`);
  }

  toString(): string {
    return `☁️ [SoundCloud] ${this.title} (${this.url})`;
  }

  toJSON(): SoundCloudJSON {
    const { url, user, thumbnail, title, duration } = this;
    return { type: 'soundcloud', url, user, thumbnail, title, duration };
  }
  static fromJSON(
    { url, user, thumbnail, title, duration }: SoundCloudJSON,
    requester: {
      uid: string;
      name: string;
    }
  ): SoundCloudMedia {
    return new SoundCloudMedia(
      url,
      user,
      thumbnail,
      title,
      duration,
      requester
    );
  }

  getEmbed() {
    const { user, thumbnail, url } = this;
    const embed = super
      .getEmbed()
      .setColor('ORANGE')
      .setURL(url)
      .setAuthor({
        name: user.name,
        url: user.url
      })
      .setThumbnail(thumbnail);
    return embed;
  }

  static async fromTrack(
    track: SoundCloudTrack,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<SoundCloudMedia> {
    const { url, name, durationInSec: duration, thumbnail, user } = track;
    return new SoundCloudMedia(url, user, thumbnail, name, duration, requester);
  }

  static async fromURL(
    url: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<SoundCloudMedia> {
    if ((await play.so_validate(url)) !== 'track') return Promise.reject();

    const track = (await play.soundcloud(url)) as SoundCloudTrack;
    return this.fromTrack(track, requester);
  }

  static fromId(
    id: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<SoundCloudMedia> {
    const url = SpotifyMedia.id2URL(id);
    return this.fromURL(url, requester);
  }

  static async fromListURL(
    url: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<SoundCloudMedia[]> {
    if ((await play.so_validate(url)) !== 'playlist') return Promise.reject();

    const playlist = (await play.soundcloud(url)) as SoundCloudPlaylist;
    const tracks = await playlist.all_tracks();
    return Promise.all(
      tracks.map(track => SoundCloudMedia.fromTrack(track, requester))
    );
  }
}

interface URLJSON extends MediaJSON {
  type: 'url';
  url: string;
}
export class URLMedia extends Media {
  constructor(
    public url: string,
    requester: {
      uid: string;
      name: string;
    }
  ) {
    super(url.slice(0, 100), NaN, requester);
  }

  get iconURL() {
    return 'https://static.thenounproject.com/png/2391758-200.png';
  }

  log() {
    const { title, url } = this;
    console.log(chalk`🔗 {blue [URL]}
${title} (${url})`);
  }

  toString(): string {
    return `🔗 [URL] ${this.title} (${this.url})`;
  }

  toJSON(): URLJSON {
    const { url, title, duration } = this;
    return { type: 'url', url, title, duration };
  }
  static fromJSON(
    { url }: URLJSON,
    requester: {
      uid: string;
      name: string;
    }
  ): URLMedia {
    return new URLMedia(url, requester);
  }

  getEmbed() {
    return super.getEmbed().setColor('BLUE').setURL(this.url);
  }

  static async fromURL(
    url: string,
    requester: {
      uid: string;
      name: string;
    }
  ): Promise<URLMedia> {
    return new URLMedia(url, requester);
  }
}

interface FileJSON extends MediaJSON {
  type: 'file';
  path: string;
}
export class FileMedia extends Media {
  constructor(
    public path: string,
    title: string,
    duration: number,
    requester: {
      uid: string;
      name: string;
    }
  ) {
    super(title, duration, requester);
  }

  get iconURL() {
    return 'https://cdn0.iconfinder.com/data/icons/data-outline/512/text_file-512.png';
  }

  log() {
    const { title, path } = this;
    console.log(chalk`📄 {magenta [File]}
${title} (${path})`);
  }

  toString(): string {
    return `📄 [File] ${this.title} (${this.path})`;
  }

  toJSON(): FileJSON {
    const { path, title, duration } = this;
    return { type: 'file', path, title, duration };
  }
  static fromJSON(
    { path, title, duration }: FileJSON,
    requester: {
      uid: string;
      name: string;
    }
  ): FileMedia {
    return new FileMedia(path, title, duration, requester);
  }

  getEmbed() {
    return super.getEmbed().setColor('BLURPLE').setURL(this.path);
  }
}

export type MediaType =
  | YouTubeMedia
  | SpotifyMedia
  | SoundCloudMedia
  | URLMedia
  | FileMedia;
export type MediaJSONType =
  | YouTubeJSON
  | SpotifyJSON
  | SoundCloudJSON
  | URLJSON
  | FileJSON;
