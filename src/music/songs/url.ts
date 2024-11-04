import { ensureCacheSubDir } from "$lib/cache";
import logger from "$lib/logger";
import {
  type GetResourceListeners,
  type GetResourceOptions,
  type Requester,
  type SongJSON,
  Song,
  streamFileWithOptions,
} from "./shared";
import { createAudioResource, StreamType } from "@discordjs/voice";
import chalk from "chalk-template";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

export async function getFile(url: string, listeners?: GetResourceListeners) {
  const youtubeCachePath = await ensureCacheSubDir("songs");
  const id = createHash("sha256").update(url).digest("base64url");
  const fileName = `${id}.opus`;
  const filePath = path.join(youtubeCachePath, fileName);

  if (!existsSync(filePath)) {
    listeners?.ondownloading?.();
    const process = spawn(
      "yt-dlp",
      ["-x", "--audio-format", "opus", "-o", fileName, url],
      { cwd: youtubeCachePath },
    );
    await new Promise((resolve, reject) => {
      process.on("exit", resolve);
      process.on("error", reject);
    });
  }

  return filePath;
}

export async function streamFile(url: string, options?: GetResourceOptions) {
  const filePath = await getFile(url);
  return streamFileWithOptions(filePath, options);
}

export interface URLJSON extends SongJSON {
  type: "url";
  url: string;
}
export class URLSong extends Song {
  constructor(
    public url: string,
    requester: Requester,
  ) {
    super({ title: url.split("/").pop() || url, duration: 0, requester });
  }

  get iconURL() {
    return "https://static.thenounproject.com/png/2391758-200.png";
  }

  log() {
    const { title, url } = this;
    logger.debug(chalk`🔗 {blue [URL]}
${title} (${url})`);
  }

  toString(): string {
    return `🔗 [URL] ${this.title} (${this.url})`;
  }

  toJSON(): URLJSON {
    const { url, title, duration } = this;
    return { type: "url", url, title, duration };
  }

  static fromJSON({ url }: URLJSON, requester: Requester): URLSong {
    return new URLSong(url, requester);
  }

  override getEmbed() {
    return super.getEmbed().setColor("Blue").setURL(this.url);
  }

  static fromURL(url: string, requester: Requester): URLSong {
    return new URLSong(url, requester);
  }

  override async _prepare(listeners?: GetResourceListeners) {
    await getFile(this.url, listeners);
  }

  async getResource(options: GetResourceOptions) {
    const stream = await streamFile(this.url, options);
    const resource = createAudioResource(stream, {
      inputType: StreamType.Opus,
      metadata: this,
    });
    return resource;
  }
}
