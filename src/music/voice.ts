import { getLyrics } from "$lib/genius";
import logger from "$lib/logger";
import { formatTime } from "$lib/time";
import { getSongsFromQuery } from "./plan";
import Queue from "./queue";
import { SpotifySong, URLSong, type Requester } from "./songs";
import Stream from "./stream";
import { AudioPlayerStatus } from "@discordjs/voice";
import { pipe } from "@iz7n/std/fn";
import { collect, map, take } from "@iz7n/std/iter";
import { shuffle } from "@iz7n/std/random";
import { quantify } from "@iz7n/std/string";
import {
  type MessagePayload,
  ChannelType,
  type Attachment,
  type Message,
  type MessageCreateOptions,
  type TextChannel,
} from "discord.js";
import { TypedEmitter } from "tiny-typed-emitter";

export default class Voice extends TypedEmitter<{
  stop: () => void;
}> {
  stream = new Stream()
    .on("idle", async () => {
      try {
        if (this.queue.hasNext()) {
          // eslint-disable-next-line unicorn/require-array-join-separator
          await this.stream.join();
          await this.play();
        } else {
          this.stream.stop();
        }
      } catch (error) {
        logger.error("⚠️ Player error:", error);
        await this.send("⚠️ Error");
        await this.next();
      }
    })
    .on("error", async error => {
      logger.error("⚠️ Player error:", error);
      await this.send("⚠️ Error");
      try {
        await this.next();
      } catch (error) {
        logger.error("⚠️ Error:", error);
      }
    });

  channel?: TextChannel;
  queue = new Queue(this);
  private message?: Message;

  constructor(readonly guildId: string) {
    super();
  }

  setChannels(message: Message): void {
    const { channel, member } = message;
    if (channel.type === ChannelType.GuildText) {
      this.channel = channel;
    }
    const voiceChannel = member?.voice.channel;
    if (voiceChannel?.type === ChannelType.GuildVoice) {
      this.stream.channel = voiceChannel;
    }
  }

  async send(message: string | MessagePayload | MessageCreateOptions) {
    this.message?.delete().catch(() => null);
    if (this.channel) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      this.message = await this.channel?.send(message).catch(() => undefined);
    } else {
      logger.error("voice tried to send a message before a channel was set");
    }
  }

  async getSongsFromQuery(message: Message, query?: string) {
    const { author, member, attachments } = message;
    const requester = {
      uid: author.id,
      name: member?.nickname || author.username,
    };

    await this.queueFiles(attachments.values(), requester);

    if (query) {
      const { songs, errors } = await getSongsFromQuery(query);

      if (errors.length) {
        await this.send(`🚫 Error:
${errors.map(({ name, query }) => `Invalid ${name}: ${query}`).join("\n")}`);
      }

      return songs;
    }

    return [];
  }

  async queueFiles(attachments: Iterable<Attachment>, requester: Requester) {
    const urlSongsCache = new Map<string, URLSong>();
    for (const { url } of attachments) {
      let song = urlSongsCache.get(url);
      if (!song) {
        song = URLSong.fromURL(url);
        song.requester = requester;
        urlSongsCache.set(url, song);
      }

      this.queue.push(song);
      song.log();
      if (this.stream.player.state.status === AudioPlayerStatus.Playing) {
        await this.send(`⏏️ Added ${song.getMarkdown()} to queue`);
      }
    }
  }

  async add(message: Message, query?: string, shuff = false) {
    this.setChannels(message);
    const { queue, channel } = this;

    const songs = await this.getSongsFromQuery(message, query);
    queue.push(...(shuff ? shuffle(songs) : songs));

    if (songs.length) {
      const pageSize = 10;
      await channel?.send(
        `⏏️ Added${shuff ? " & shuffled" : ""} ${quantify("song", songs.length)} to the queue:
${pipe(
  songs,
  map(song => `- [${formatTime(song.duration)}] ${song.getMarkdown()}`),
  take(pageSize),
  collect,
).join("\n")}${
          songs.length > pageSize ?
            `
(${songs.length - pageSize} more)`
          : ""
        }`,
      );
    }

    await this.play();
  }

  async seek(seconds: number) {
    const { stream } = this;
    const { resource, filters } = stream;
    if (!resource) {
      await this.send("🚫 There is currently no song playing");
      return;
    }

    stream.resource = await resource.metadata.getResource({
      seek: seconds,
      filters,
    });
    await this.stream.play();
  }

  async next() {
    await this.play(true);
    await this.channel?.send("⏩ Next");
  }

  async move(from: number, to: number) {
    const song1 = this.queue.at(from);
    const song2 = this.queue.at(to);
    this.queue.move(from, to);
    await this.send(
      `➡️ Moved song #${from + 1} ${song1?.getMarkdown() || ""} -> #${to + 1} ${song2?.getMarkdown() || ""}`,
    );
  }

  stop() {
    this.stream.stop();
    this.queue.reset();
    this.channel = undefined;
    this.emit("stop");
  }

  async play(skip = false) {
    const { stream } = this;
    if (stream.player.state.status === AudioPlayerStatus.Playing && !skip) {
      // eslint-disable-next-line ts/no-floating-promises
      this.prepareNextSong();
      return;
    }

    const song = this.queue.next();
    if (!song) {
      await this.send("📭 The queue is empty");
      this.stop();
      return;
    }

    await song.prepare({
      // eslint-disable-next-line ts/no-misused-promises
      ondownloading: async () => this.send(`⏬ Downloading ${song.title}...`),
    });
    const resource = await song.getResource({
      filters: stream.filters,
    });
    await stream.play(resource);
    // eslint-disable-next-line ts/no-floating-promises
    this.prepareNextSong();

    try {
      const embed = song.getEmbed().setTitle(`▶️ Now Playing: ${song.title}`);
      await this.send({
        embeds: [embed],
      });
    } catch (error) {
      logger.error("Error creating embed:", error);
    }
  }

  async prepareNextSong() {
    const nextSong = this.queue[this.queue.currentIndex + 1];
    if (nextSong) {
      return nextSong.prepare();
    }
  }

  songQueueEmbed(n: number) {
    return this.queue.songEmbed(n - 1);
  }

  async getLyrics(query?: string) {
    if (query) {
      return getLyrics(query);
    }
    const { current } = this.queue;
    if (current) {
      const { title } = current;
      if (current instanceof SpotifySong) {
        return getLyrics(`${title} ${current.artist?.name}`);
      }
      return getLyrics(title);
    }

    return "No song playing";
  }

  async setFilters(filters?: string[]) {
    return this.stream.setFilters(filters);
  }
}
