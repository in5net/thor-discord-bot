import { Awaitable } from "@in5net/std/types";
import { getPlayDl } from "./play";
import {
	SongType,
	SoundCloudSong,
	SpotifySong,
	URLSong,
	YouTubeSong,
} from "./song";
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
import { Message } from "discord.js";

export const YOUTUBE_CHANNEL_REGEX = createRegExp(
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

export const URL_REGEX = createRegExp(
	anyOf(letter.lowercase, digit, charIn("-@:%._+~#=")).times.between(1, 256),
	".",
	anyOf(letter.lowercase, digit, charIn("()")).times.between(1, 6),
	wordBoundary,
	anyOf(letter.lowercase, digit, charIn("-()@:%_+.~#?&//=")).times.any(),
	[caseInsensitive],
);

export async function generatePlanFromQuery(message: Message, query?: string) {
	const { author, member, attachments } = message;
	const requester = {
		uid: author.id,
		name: member?.nickname || author.username,
	};

	const queries = query ? splitQueries(query) : [];
	queries.unshift(...Array.from(attachments.values()).map(a => a.url));

	const cache: string[] = [];
	const play = await getPlayDl(true);

	const matchers: Array<{
		name: string;
		check(query: string): Awaitable<boolean>;
		getSongs(query: string): Promise<SongType[]>;
	}> = [
		{
			name: "load YouTube playlist",
			check: query => play.yt_validate(query) === "playlist",
			async getSongs(query) {
				const id = play.extractID(query);
				const { songs } = await YouTubeSong.fromPlaylistId(id, requester);
				return songs;
			},
		},
		{
			name: "load YouTube video",
			check: query => play.yt_validate(query) === "video",
			async getSongs(query) {
				const song = await YouTubeSong.fromURL(query, requester);
				return [song];
			},
		},
		{
			name: "load YouTube videos from channel",
			check: query => YOUTUBE_CHANNEL_REGEX.test(query),
			async getSongs(query) {
				const id = YOUTUBE_CHANNEL_REGEX.exec(query)?.[2] || "";
				const videos = await YouTubeSong.fromChannelId(id, requester);
				return videos;
			},
		},
		{
			name: "query YouTube from Spotify song",
			check: query => play.sp_validate(query) === "track",
			async getSongs(query) {
				const song = await SpotifySong.fromURL(query, requester);
				return [song];
			},
		},
		{
			name: "query YouTube from Spotify album/playlist",
			check: query =>
				["album", "playlist"].includes(play.sp_validate(query) as string),
			async getSongs(query) {
				const songs = await SpotifySong.fromListURL(query, requester);
				return songs;
			},
		},
		{
			name: "load SoundCloud song",
			check: async query => (await play.so_validate(query)) === "track",
			async getSongs(query) {
				const song = await SoundCloudSong.fromURL(query, requester);
				return [song];
			},
		},
		{
			name: "load SoundCloud playlist",
			check: async query => (await play.so_validate(query)) === "playlist",
			async getSongs(query) {
				const songs = await SoundCloudSong.fromListURL(query, requester);
				return songs;
			},
		},
		{
			name: "load song from url",
			check: query => URL_REGEX.test(query),
			async getSongs(query) {
				const song = URLSong.fromURL(query, requester);
				return [song];
			},
		},
		{
			name: "query YouTube",
			check: () => true,
			async getSongs(query) {
				const song = await YouTubeSong.fromSearch(query, requester);
				return [song];
			},
		},
	];

	interface PlanItem {
		name: string;
		query: string;
	}
	const plan: PlanItem[] = [];
	for (const query of queries) {
		const cacheIndex = cache.indexOf(query);
		if (cacheIndex !== -1) {
			plan.push({ name: `load from cache (${cacheIndex + 1})`, query });
			continue;
		}

		for (const { name, check } of matchers) {
			if (await check(query)) {
				plan.push({ name, query });
				cache.push(query);
				break;
			}
		}
	}

	return plan;
}

export function splitQueries(query: string) {
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
