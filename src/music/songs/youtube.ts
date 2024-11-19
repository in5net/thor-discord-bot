import logger from "$lib/logger";
import { ensureCacheSubDir } from "$lib/cache";
import { getPlayDl } from "../play";
import {
  type Album,
  type GetResourceListeners,
  type GetResourceOptions,
  type Requester,
  type SongJSON,
  Song,
  streamFileWithOptions,
} from "./shared";
import { createAudioResource, StreamType } from "@discordjs/voice";
import chalk from "chalk-template";
import { createRegExp, digit, oneOrMore } from "magic-regexp";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import Innertube from "youtubei.js";
import { z } from "zod";

export async function getYoutubeFile(
  id: string,
  listeners?: GetResourceListeners,
) {
  const youtubeCachePath = await ensureCacheSubDir("youtube");
  const fileName = `${id}.opus`;
  const filePath = path.join(youtubeCachePath, fileName);

  if (!existsSync(filePath)) {
    listeners?.ondownloading?.();
    const process = spawn(
      "yt-dlp",
      [
        "-x",
        "--audio-format",
        "opus",
        "-o",
        fileName,
        `https://youtube.com/watch?v=${id}`,
      ],
      { cwd: youtubeCachePath },
    );
    await new Promise((resolve, reject) => {
      process.on("exit", resolve);
      process.on("error", reject);
    });
  }

  return filePath;
}

export async function streamYoutubeFile(
  id: string,
  options?: GetResourceOptions,
) {
  const filePath = await getYoutubeFile(id);
  return streamFileWithOptions(filePath, options);
}

export interface Channel {
  id: string;
  title: string;
  thumbnail?: string;
}

export interface YouTubeJSON extends SongJSON {
  type: "youtube";
  id: string;
  description?: string;
  time?: number;
  thumbnail?: string;
  channel?: Channel;
}

export interface YouTubeAlbum extends Album<YouTubeSong> {
  description?: string;
}

const videosSchema = z.array(
  z.object({
    id: z.string(),
    title: z.coerce.string(),
    duration: z.object({
      seconds: z.number(),
    }),
    thumbnails: z.array(
      z.object({
        url: z.string(),
      }),
    ),
  }),
);

export class YouTubeSong extends Song {
  id: string;
  description?: string;
  time?: number;
  thumbnail?: string;
  channel?: Channel;

  constructor({
    id,
    title,
    description,
    duration,
    time,
    thumbnail,
    channel,
    requester,
  }: {
    id: string;
    title: string;
    description?: string;
    duration: number;
    time?: number;
    thumbnail?: string;
    channel?: Channel;
    requester: Requester;
  }) {
    super({ title, duration, requester });
    this.id = id;
    this.description = description;
    this.time = time;
    this.thumbnail = thumbnail;
    this.channel = channel;
    this.start = time || 0;
  }

  get iconURL() {
    return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png";
  }

  get url(): string {
    return `https://www.youtube.com/watch?v=${this.id}${
      this.time ? `&t=${this.time}` : ""
    }`;
  }

  get channelURL(): string {
    return `https://www.youtube.com/channel/${this.channel?.id}`;
  }

  log() {
    const { title, channel, url } = this;
    logger.debug(chalk`📺 {red [You{white Tube}]}
${title} (${url})
* channel: ${channel?.title}`);
  }

  toString(): string {
    return `📺 [YouTube] ${this.title} (${this.url})`;
  }

  toJSON(): YouTubeJSON {
    const { id, title, description, duration, time, thumbnail, channel } = this;
    return {
      type: "youtube",
      id,
      title,
      description,
      duration,
      time,
      thumbnail,
      channel,
    };
  }

  static fromJSON(
    { id, title, description, duration, time, thumbnail, channel }: YouTubeJSON,
    requester: Requester,
  ): YouTubeSong {
    return new YouTubeSong({
      id,
      title,
      description,
      duration,
      time,
      thumbnail,
      channel,
      requester,
    });
  }

  override getEmbed() {
    const { description, thumbnail, channel, url, channelURL } = this;
    const embed = super.getEmbed().setColor("Red").setURL(url);
    if (thumbnail) {
      embed.setThumbnail(thumbnail);
    }
    if (channel) {
      embed.setAuthor({
        name: channel.title,
        url: channelURL || undefined,
        iconURL: channel.thumbnail || undefined,
      });
    }
    const MAX_DESCRIPTION_LENGTH = 256;
    if (description) {
      embed.setDescription(
        description.length > MAX_DESCRIPTION_LENGTH ?
          `${description.slice(0, MAX_DESCRIPTION_LENGTH)}...`
        : description,
      );
    }
    return embed;
  }

  static async fromId(id: string, requester: Requester): Promise<YouTubeSong> {
    try {
      const youtube = await Innertube.create();
      const {
        basic_info: {
          title = "Unknown",
          short_description: description,
          thumbnail = [],
          duration = 0,
          channel,
        },
      } = await youtube.getBasicInfo(id);
      return new YouTubeSong({
        id,
        title,
        description,
        duration,
        thumbnail: thumbnail[0]?.url,
        channel:
          channel ?
            {
              id: channel.id,
              title: channel.name,
            }
          : undefined,
        requester,
      });
    } catch (error) {
      logger.error(error);
      return new YouTubeSong({ id, title: "", duration: 0, requester });
    }
  }

  static async fromURL(
    url: string,
    requester: Requester,
  ): Promise<YouTubeSong> {
    const play = await getPlayDl();
    const id = play.extractID(url);
    const song = await this.fromId(id, requester);
    const timeRegex = createRegExp("?t=", oneOrMore(digit).as("seconds"));
    const matches = url.match(timeRegex);
    if (matches?.groups.seconds) {
      song.time = Number.parseInt(matches.groups.seconds);
    }
    return song;
  }

  static async fromSearch(
    query: string,
    requester: Requester,
  ): Promise<YouTubeSong> {
    const youtube = await Innertube.create();
    const { videos } = await youtube.search(query, { type: "video" });
    const { id, title, description, duration, best_thumbnail } = z
      .object({
        id: z.string(),
        title: z.coerce.string(),
        description: z.string(),
        duration: z.object({
          seconds: z.number(),
        }),
        best_thumbnail: z.object({
          url: z.string(),
        }),
      })
      .parse(videos.first());
    return new YouTubeSong({
      id,
      title,
      description,
      duration: duration.seconds,
      thumbnail: best_thumbnail.url,
      requester,
    });
  }

  static async fromPlaylistId(
    id: string,
    requester: Requester,
  ): Promise<YouTubeAlbum> {
    const youtube = await Innertube.create();
    const {
      info: { title = "", description },
      videos,
    } = await youtube.getPlaylist(id);
    const songs: YouTubeSong[] = [];
    for (const {
      id,
      title,
      duration: { seconds },
      thumbnails: [thumbnail],
    } of videosSchema.parse(videos)) {
      songs.push(
        new YouTubeSong({
          id,
          title: title.toString(),
          duration: seconds,
          thumbnail: thumbnail?.url,
          requester,
        }),
      );
    }

    return {
      name: title,
      description,
      songs,
    };
  }

  static async fromChannelId(
    id: string,
    requester: Requester,
  ): Promise<YouTubeSong[]> {
    const youtube = await Innertube.create();
    const channel = await youtube.getChannel(id);
    const { videos } = await channel.getVideos();
    const songs: YouTubeSong[] = [];
    for (const {
      id,
      title,
      duration: { seconds },
      thumbnails: [thumbnail],
    } of videosSchema.parse(videos)) {
      songs.push(
        new YouTubeSong({
          id,
          title: title.toString(),
          duration: seconds,
          thumbnail: thumbnail?.url,
          channel: {
            id,
            title: channel.title || "",
            thumbnail: channel.metadata.thumbnail?.[0]?.url || "",
          },
          requester,
        }),
      );
    }

    return songs;
  }

  override async _prepare(listeners?: GetResourceListeners) {
    await getYoutubeFile(this.id, listeners);
  }

  async getResource(options: GetResourceOptions) {
    const stream = await streamYoutubeFile(this.id, options);
    const resource = createAudioResource(stream, {
      inputType: StreamType.Opus,
      metadata: this,
    });
    return resource;
  }
}
