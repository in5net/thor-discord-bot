import type { AudioResource } from "@discordjs/voice";
import { EmbedBuilder, hideLinkEmbed, hyperlink } from "discord.js";
import { type ReadStream, createReadStream } from "node:fs";
import prism from "prism-media";

export interface SongJSON {
  title: string;
  duration: number; // Seconds
}

export interface StreamOptions {
  seek?: number;
  filters?: string[];
}
export interface GetResourceListeners {
  ondownloading?: () => void;
}
export interface GetResourceOptions
  extends StreamOptions,
    GetResourceListeners {}

export interface Album<T extends Song> {
  name: string;
  songs: T[];
}

export abstract class Song implements SongJSON {
  title: string;
  duration: number;
  start = 0;
  private preparePromise?: Promise<void>;

  abstract url: string;
  abstract iconURL: string;

  constructor({ title, duration }: { title: string; duration: number }) {
    this.title = title;
    this.duration = duration;
  }

  getMarkdown() {
    return hyperlink(this.title, hideLinkEmbed(this.url));
  }

  getEmbed() {
    return new EmbedBuilder().setTitle(this.title);
  }

  async _prepare(_listeners?: GetResourceListeners) {}

  async prepare(listeners?: GetResourceListeners) {
    if (this.preparePromise) {
      return this.preparePromise;
    }
    // eslint-disable-next-line no-underscore-dangle
    const preparePromise = this._prepare(listeners);
    return (this.preparePromise = preparePromise);
  }

  abstract getResource(
    options: GetResourceOptions,
  ): Promise<AudioResource<Song>>;

  abstract log(): void;

  abstract toString(): string;

  abstract toJSON(): SongJSON;
}

export function streamWithOptions(
  stream: ReadStream,
  { seek, filters }: StreamOptions = {},
) {
  const ffmpegArgs: string[] = [
    "-analyzeduration",
    "0",
    "-loglevel",
    "0",
    "-f",
    "s16le",
    "-ar",
    "48000",
    "-ac",
    "2",
  ];
  if (seek) {
    ffmpegArgs.push("-ss", seek.toString());
  }
  if (filters?.length) {
    ffmpegArgs.push("-af", filters.join(","));
  }

  const transcoder = new prism.FFmpeg({
    args: ffmpegArgs,
  });

  const opusEncoder = new prism.opus.Encoder({
    rate: 48_000,
    channels: 2,
    frameSize: 960,
  });

  return stream.pipe(transcoder).pipe(opusEncoder);
}

export function streamFileWithOptions(
  filePath: string,
  options?: StreamOptions,
) {
  const inputStream = createReadStream(filePath);
  return streamWithOptions(inputStream, options);
}
