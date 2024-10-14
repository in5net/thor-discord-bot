import { getPlayDl } from "../play";
import {
  GetResourceOptions,
  Requester,
  Song,
  SongJSON,
  streamWithOptions,
} from "./shared";
import { createAudioResource } from "@discordjs/voice";
import { memo } from "@in5net/std/fn";
import chalk from "chalk-template";
import logger from "$lib/logger";
import { SoundCloudPlaylist, SoundCloudTrack } from "play-dl";

const playSC = memo(async () => {
  const play = await getPlayDl();
  const clientId = await play.getFreeClientID();
  await play.setToken({
    soundcloud: {
      client_id: clientId,
    },
  });
  return play;
});

export interface SoundCloudJSON extends SongJSON {
  type: "soundcloud";
  url: string;
  thumbnail: string;
  user: {
    id: string;
    name: string;
    url: string;
  };
}
export class SoundCloudSong extends Song {
  url: string;
  thumbnail: string;
  user: {
    id: string;
    name: string;
    url: string;
  };

  constructor({
    url,
    title,
    duration,
    thumbnail,
    user,
    requester,
  }: {
    url: string;
    title: string;
    duration: number;
    thumbnail: string;
    user: {
      id: string;
      name: string;
      url: string;
    };
    requester: Requester;
  }) {
    super({ title, duration, requester });
    this.url = url;
    this.thumbnail = thumbnail;
    this.user = user;
  }

  get iconURL() {
    return "https://mpng.subpng.com/20190609/ibv/kisspng-logo-font-brand-clip-art-trademark-francesco-tristano-contact-5cfda0624d6629.175959541560125538317.jpg";
  }

  log() {
    const { title, url, user } = this;
    logger.debug(chalk`☁️ {orange [SoundCloud]}
${title} (${url})
* user: ${user.name} (${user.url})`);
  }

  toString(): string {
    return `☁️ [SoundCloud] ${this.title} (${this.url})`;
  }

  toJSON(): SoundCloudJSON {
    const { url, user, thumbnail, title, duration } = this;
    return { type: "soundcloud", url, user, thumbnail, title, duration };
  }

  static fromJSON(
    { url, title, duration, thumbnail, user }: SoundCloudJSON,
    requester: Requester,
  ): SoundCloudSong {
    return new SoundCloudSong({
      url,
      title,
      duration,
      thumbnail,
      user,
      requester,
    });
  }

  override getEmbed() {
    const { user, thumbnail, url } = this;
    const embed = super
      .getEmbed()
      .setColor("Orange")
      .setURL(url)
      .setAuthor({
        name: user.name,
        url: user.url,
      })
      .setThumbnail(thumbnail);
    return embed;
  }

  static fromTrack(
    track: SoundCloudTrack,
    requester: Requester,
  ): SoundCloudSong {
    const { url, name, durationInSec: duration, thumbnail, user } = track;
    return new SoundCloudSong({
      url,
      title: name,
      duration,
      thumbnail,
      user,
      requester,
    });
  }

  static async fromURL(
    url: string,
    requester: Requester,
  ): Promise<SoundCloudSong> {
    const play = await playSC();
    if ((await play.so_validate(url)) !== "track")
      throw new Error("Invalid URL");

    const track = (await play.soundcloud(url)) as SoundCloudTrack;
    return this.fromTrack(track, requester);
  }

  static async fromListURL(
    url: string,
    requester: Requester,
  ): Promise<SoundCloudSong[]> {
    const play = await playSC();
    if ((await play.so_validate(url)) !== "playlist")
      throw new Error("Invalid URL");

    const playlist = (await play.soundcloud(url)) as SoundCloudPlaylist;
    const tracks = await playlist.all_tracks();
    return Promise.all(
      tracks.map(track => SoundCloudSong.fromTrack(track, requester)),
    );
  }

  async getResource(options: GetResourceOptions) {
    const play = await playSC();
    const { stream } = await play.stream(this.url);
    const filteredStream = streamWithOptions(stream, options);

    const resource = createAudioResource(filteredStream, {
      metadata: this,
    });
    return resource;
  }
}
