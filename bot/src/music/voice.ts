import { getLyrics } from "$lib/genius";
import { sec2Str } from "$src/lib/time";
import { URL_REGEX, YOUTUBE_CHANNEL_REGEX, splitQueries } from "./plan";
import { getPlayDl } from "./play";
import Queue from "./queue";
import {
	SoundCloudSong,
	SpotifySong,
	URLSong,
	YouTubeSong,
	type Requester,
	type SongType,
} from "./song";
import Stream from "./stream";
import { AudioPlayerStatus } from "@discordjs/voice";
import { pipe } from "@in5net/std/fn";
import { collect, map, take } from "@in5net/std/iter";
import { shuffle } from "@in5net/std/random";
import { quantify } from "@in5net/std/string";
import { type Awaitable } from "@in5net/std/types";
import {
	ChannelType,
	MessagePayload,
	type Attachment,
	type Message,
	type MessageCreateOptions,
	type TextChannel,
} from "discord.js";
import logger from "logger";
import { TypedEmitter } from "tiny-typed-emitter";

export default class Voice extends TypedEmitter<{
	stop: () => void;
}> {
	stream = new Stream()
		.on("idle", async () => {
			try {
				if (this.queue.hasNext()) {
					// eslint-disable-next-line unicorn/require-array-join-separator
					this.stream.join();
					await this.play();
				} else this.stream.stop();
			} catch (error) {
				logger.error("⚠️ Player error:", error);
				await this.send("⚠️ Error");
				await this.next();
			}
		})
		.on("error", async error => {
			logger.error("⚠️ Player error:", error);
			try {
				await this.send("⚠️ Error");
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
		if (channel.type === ChannelType.GuildText) this.channel = channel;
		const voiceChannel = member?.voice.channel;
		if (voiceChannel?.type === ChannelType.GuildVoice)
			this.stream.channel = voiceChannel;
	}

	async send(message: string | MessagePayload | MessageCreateOptions) {
		this.message?.delete().catch(() => null);
		if (this.channel) this.message = await this.channel?.send(message);
		else logger.error("voice tried to send a message before a channel was set");
	}

	async getSongsFromQuery(message: Message, query?: string) {
		const { author, member, attachments } = message;
		const requester = {
			uid: author.id,
			name: member?.nickname || author.username,
		};

		await this.queueFiles(attachments.values(), requester);

		const queries = query ? splitQueries(query) : [];

		const songs: SongType[] = [];
		const songsCache = new Map<string, SongType[]>();
		const play = await getPlayDl(true);

		const matchers: Array<{
			name: string;
			check: (query: string) => Awaitable<boolean>;
			getSongs: (query: string) => Promise<SongType[]>;
		}> = [
			{
				name: "YouTube playlist url",
				check: query => play.yt_validate(query) === "playlist",
				async getSongs(query) {
					const id = play.extractID(query);
					const { songs } = await YouTubeSong.fromPlaylistId(id, requester);
					return songs;
				},
			},
			{
				name: "YouTube video url",
				check: query => play.yt_validate(query) === "video",
				async getSongs(query) {
					const song = await YouTubeSong.fromURL(query, requester);
					return [song];
				},
			},
			{
				name: "YouTube channel url",
				check: query => YOUTUBE_CHANNEL_REGEX.test(query),
				async getSongs(query) {
					const id = YOUTUBE_CHANNEL_REGEX.exec(query)?.[2] || "";
					const videos = await YouTubeSong.fromChannelId(id, requester);
					return videos;
				},
			},
			{
				name: "Spotify song url",
				check: query => play.sp_validate(query) === "track",
				async getSongs(query) {
					const song = await SpotifySong.fromURL(query, requester);
					return [song];
				},
			},
			{
				name: "Spotify album/playlist url",
				check: query =>
					["album", "playlist"].includes(play.sp_validate(query) as string),
				async getSongs(query) {
					const songs = await SpotifySong.fromListURL(query, requester);
					return songs;
				},
			},
			{
				name: "SoundCloud song url",
				check: async query => (await play.so_validate(query)) === "track",
				async getSongs(query) {
					const song = await SoundCloudSong.fromURL(query, requester);
					return [song];
				},
			},
			{
				name: "SoundCloud playlist url",
				check: async query => (await play.so_validate(query)) === "playlist",
				async getSongs(query) {
					const songs = await SoundCloudSong.fromListURL(query, requester);
					return songs;
				},
			},
			{
				name: "song url",
				check: query => URL_REGEX.test(query),
				async getSongs(query) {
					const song = URLSong.fromURL(query, requester);
					return [song];
				},
			},
			{
				name: "YouTube query",
				check: () => true,
				async getSongs(query) {
					const song = await YouTubeSong.fromSearch(query, requester);
					return [song];
				},
			},
		];

		for (const query of queries) {
			const mds = songsCache.get(query);
			if (mds) {
				songs.push(...mds);
				continue;
			}

			for (const { name, check, getSongs } of matchers) {
				if (await check(query)) {
					try {
						const chunk = await getSongs(query);
						songs.push(...chunk);
						songsCache.set(query, chunk);
						break;
					} catch (error) {
						logger.error(error);
						await this.send(`🚫 Invalid ${name}`);
					}
				}
			}
		}

		return songs;
	}

	async queueFiles(attachments: Iterable<Attachment>, requester: Requester) {
		const urlSongsCache = new Map<string, URLSong>();
		for (const { url } of attachments) {
			let song = urlSongsCache.get(url);
			if (!song) {
				song = URLSong.fromURL(url, requester);
				urlSongsCache.set(url, song);
			}

			this.queue.push(song);
			song.log();
			if (this.stream.player.state.status === AudioPlayerStatus.Playing)
				await this.send(`⏏️ Added ${song.getMarkdown()} to queue`);
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
	map(song => `- [${sec2Str(song.duration)}] ${song.getMarkdown()}`),
	take(pageSize),
	collect,
).join(
	"\n",
)}${songs.length > pageSize ? `(${songs.length - pageSize} more)` : ""}`,
			);
		}

		await this.play();
	}

	async seek(seconds: number) {
		const { stream } = this;
		const { resource, filters } = stream;
		if (!resource) {
			this.send("🚫 There is currently no song playing");
			return;
		}

		stream.resource = await resource.metadata.getResource({
			seek: seconds,
			filters,
		});
		this.stream.play();
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
		if (stream.player.state.status === AudioPlayerStatus.Playing && !skip)
			return;

		const song = this.queue.next();
		if (!song) {
			await this.send("📭 The queue is empty");
			this.stop();
			return;
		}

		const resource = await song.getResource(stream);
		stream.play(resource);

		try {
			const embed = song.getEmbed().setTitle(`▶️ Now Playing: ${song.title}`);
			await this.send({
				embeds: [embed],
			});
		} catch (error) {
			logger.error("Error creating embed:", error);
		}
	}

	async songQueueEmbed(n: number) {
		return this.queue.songEmbed(n - 1);
	}

	async getLyrics(query?: string) {
		if (query) return getLyrics(query);
		const { current } = this.queue;
		if (current) {
			const { title } = current;
			if (current instanceof SpotifySong)
				return getLyrics(`${title} ${current.artist?.name}`);
			return getLyrics(title);
		}

		return "No song playing";
	}

	async setFilters(filters?: string[]) {
		return this.stream.setFilters(filters);
	}
}
