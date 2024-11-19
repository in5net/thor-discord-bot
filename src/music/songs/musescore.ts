import logger from "$lib/logger";
import { ensureCacheSubDir } from "$lib/cache";
import { parseTime } from "$lib/time";
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
import { muse } from "musescore-metadata";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, rename, stat } from "node:fs/promises";
import path from "node:path";

async function getMusescoreFile(
  id: string,
  url: string,
  listeners?: GetResourceListeners,
) {
  const musescoreCachePath = await ensureCacheSubDir("musescore");
  const filePath = path.join(musescoreCachePath, `${id}.mp3`);

  if (!existsSync(filePath)) {
    listeners?.ondownloading?.();
    const process = spawn("bunx", ["dl-librescore", "-i", url, "-t", "mp3"], {
      cwd: musescoreCachePath,
    });
    await new Promise((resolve, reject) => {
      process.on("exit", resolve);
      process.on("error", reject);
    });

    const fileNames = await readdir(musescoreCachePath);
    let mostRecentFileName = "";
    let mostRecentFileTime = 0;
    for (const fileName of fileNames) {
      const stats = await stat(path.join(musescoreCachePath, fileName));
      if (stats.ctimeMs > mostRecentFileTime) {
        mostRecentFileName = fileName;
        mostRecentFileTime = stats.ctimeMs;
      }
    }
    await rename(path.join(musescoreCachePath, mostRecentFileName), filePath);
  }

  return filePath;
}

async function streamMusescoreFile(
  id: string,
  url: string,
  options?: GetResourceOptions,
) {
  const filePath = await getMusescoreFile(id, url, options);
  return streamFileWithOptions(filePath, options);
}

export interface MusescoreJSON extends SongJSON {
  type: "musescore";
  id: string;
  url: string;
  description: string;
}
export class MusescoreSong extends Song {
  id: string;
  url: string;
  description: string;

  constructor({
    id,
    url,
    title,
    description,
    duration,
    requester,
  }: {
    id: string;
    url: string;
    title: string;
    description: string;
    duration: number;
    requester: Requester;
  }) {
    super({ title, duration, requester });
    this.id = id;
    this.url = url;
    this.description = description;
  }

  get iconURL() {
    return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/MuseScore_Icon.svg/50px-MuseScore_Icon.svg.png";
  }

  log() {
    const { title, url } = this;
    logger.debug(chalk`📺 {blue [Musescore]}
${title} (${url})`);
  }

  toString(): string {
    return `🎼 [Musescore] ${this.title} (${this.url})`;
  }

  toJSON(): MusescoreJSON {
    const { id, url, title, description, duration } = this;
    return {
      type: "musescore",
      id,
      url,
      title,
      description,
      duration,
    };
  }

  static fromJSON(
    { id, url, title, description, duration }: MusescoreJSON,
    requester: Requester,
  ): MusescoreSong {
    return new MusescoreSong({
      id,
      url,
      title,
      description,
      duration,
      requester,
    });
  }

  override getEmbed() {
    const { url, description } = this;
    const embed = super.getEmbed().setColor("Blue").setURL(url);
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

  static async fromURL(
    url: string,
    requester: Requester,
  ): Promise<MusescoreSong> {
    const metadata = await muse(url);
    return new MusescoreSong({
      id: metadata.id.toString(),
      url: metadata.url,
      title: metadata.title,
      description: metadata.description,
      duration: parseTime(metadata.duration),
      requester,
    });
  }

  override async _prepare(listeners?: GetResourceListeners) {
    await getMusescoreFile(this.id, this.url, listeners);
  }

  async getResource(options: GetResourceOptions) {
    const stream = await streamMusescoreFile(this.id, this.url, options);
    const resource = createAudioResource(stream, {
      inputType: StreamType.Opus,
      metadata: this,
    });
    return resource;
  }
}
