import { getLyrics } from "$services/genius";
import { AudioPlayerStatus } from "@discordjs/voice";
import { shuffle } from "@in5net/std/random";
import { type Awaitable } from "@in5net/std/types";
import {
	ChannelType,
	type Attachment,
	type Message,
	type MessageCreateOptions,
	type TextChannel,
} from "discord.js";
import logger from "logger";
import {
	anyOf,
	caseInsensitive,
	charIn,
	createRegExp,
	digit,
	exactly,
	letter,
	maybe,
	oneOrMore,
	wordBoundary,
} from "magic-regexp";
import { TypedEmitter } from "tiny-typed-emitter";
import { getPlayDl } from "./play";
import * as playlist from "./playlist";
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

const YOUTUBE_CHANNEL_REGEX = createRegExp(
	"http",
	maybe("s"),
	"://",
	maybe("www."),
	"youtu",
	exactly("be.com").or(".be"),
	"/",
	exactly("channel").or("c"),
	"/",
	oneOrMore(anyOf(letter.lowercase, digit, charIn("_-"))),
);

const URL_REGEX = createRegExp(
	anyOf(letter.lowercase, digit, charIn("-@:%._+~#=")).times.between(1, 256),
	".",
	anyOf(letter.lowercase, digit, charIn("()")).times.between(1, 6),
	wordBoundary,
	anyOf(letter.lowercase, digit, charIn("-()@:%_+.~#?&//=")).times.any(),
	[caseInsensitive],
);

export default class Voice extends TypedEmitter<{
	stop: () => void;
}> {
	stream = new Stream()
		.on("idle", async () => {
			try {
				if (this.queue.hasNext()) {
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
	private message?: Message;

	queue = new Queue(this);

	constructor(readonly guildId: string) {
		super();
	}

	async send(message: string | MessageCreateOptions) {
		[this.message] = await Promise.all([
			this.channel?.send(message),
			this.message?.delete().catch(() => null),
		]);
	}

	setChannels(message: Message): void {
		const { channel, member } = message;
		if (channel.type === ChannelType.GuildText) this.channel = channel;
		const voiceChannel = member?.voice.channel;
		if (voiceChannel?.type === ChannelType.GuildVoice)
			this.stream.channel = voiceChannel;
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
			check(query: string): Awaitable<boolean>;
			getSongs(query: string): Promise<SongType[]>;
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
				await this.send(`⏏️ Added ${song.title} to queue`);
		}
	}

	async add(message: Message, query?: string, shuff = false) {
		this.setChannels(message);

		const { queue, channel } = this;

		const songs = await this.getSongsFromQuery(message, query);
		console.log(songs);
		queue.push(...(shuff ? shuffle(songs) : songs));

		if (songs.length)
			await channel?.send(
				`⏏️ Added${shuff ? " & shuffled" : ""} ${songs
					.map(song => song.title)
					.slice(0, 10)
					.join(", ")}${songs.length > 10 ? ", ..." : ""} to queue`,
			);

		await this.play();
	}

	async seek(seconds: number) {
		const { stream } = this;
		const { resource, filters } = stream;
		if (!resource) return;

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

	async prev() {
		const { queue } = this;
		let song: SongType | undefined;
		if (!queue.hasPrev() || !(song = this.queue.prev()))
			return this.send("There's no previous song");

		const resource = await song.getResource(this.stream);
		this.stream.play(resource);
		await this.send(`⏪ Previous: ${song.title}`);
	}

	async move(from: number, to: number) {
		this.queue.move(from, to);
		return this.send(`➡️ Moved #${from + 1} to #${to + 1}`);
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
			await this.send("📭 Queue is empty");
			this.stop();
			return;
		}

		const resource = await song.getResource(stream);
		stream.play(resource);

		try {
			const embed = song.getEmbed().setTitle(`▶️ Playing: ${song.title}`);
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

	async playlistSave(message: Message, name: string, query?: string) {
		const { queue } = this;
		const { author, channel } = message;
		const songs = query ? await this.getSongsFromQuery(message, query) : queue;
		await playlist.save(author.id, name, songs);
		if (channel.type !== ChannelType.GuildStageVoice)
			await channel.send(`Saved playlist ${name}`);
	}

	async playlistAdd(message: Message, name: string, query?: string) {
		const { queue } = this;
		const { author, channel } = message;
		const songs = query ? await this.getSongsFromQuery(message, query) : queue;
		await playlist.add(author.id, name, songs);
		if (channel.type !== ChannelType.GuildStageVoice)
			await channel.send(`Added to playlist ${name}`);
	}
}
function splitQueries(query: string) {
	const queries: string[] = [];

	const words = query.split(" ").filter(Boolean);
	let text = "";
	for (const word of words) {
		const isUrl = URL_REGEX.test(word);
		if (isUrl) {
			if (text.trim()) {
				queries.push(text.trim());
				text = "";
			}

			queries.push(word);
		} else text += `${word} `;
	}

	if (text) {
		queries.push(...text.trim().split("\n"));
		text = "";
	}

	return queries;
}
