import logger from "$lib/logger";
import { getPlayDl } from "./play";
import {
  MusescoreSong,
  SpotifySong,
  URLSong,
  YouTubeSong,
  type SongType,
} from "./songs";
import type { Awaitable } from "@iz7n/std/types";
import type { Message } from "discord.js";
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

export const MUSESCORE_REGEX = createRegExp(
  "https://musescore.com/user/",
  oneOrMore(digit).as("userId"),
  "/scores/",
  oneOrMore(digit).as("scoreId"),
);

export const URL_REGEX = createRegExp(
  anyOf(letter.lowercase, digit, charIn("-@:%._+~#=")).times.between(1, 256),
  ".",
  anyOf(letter.lowercase, digit, charIn("()")).times.between(1, 6),
  wordBoundary,
  anyOf(letter.lowercase, digit, charIn("-()@:%_+.~#?&//=")).times.any(),
  [caseInsensitive],
);

export async function generatePlanFromQuery(
  { attachments }: Message,
  query?: string,
) {
  const start = performance.now();

  const queries = query ? splitQueries(query) : [];
  queries.unshift(...attachments.values().map(a => a.url));

  const cache: string[] = [];
  const play = await getPlayDl(true);

  const matchers: Array<{
    name: string;
    check: (query: string) => Awaitable<boolean>;
  }> = [
    {
      name: "load YouTube playlist",
      check: query => play.yt_validate(query) === "playlist",
    },
    {
      name: "load YouTube video",
      check: query => play.yt_validate(query) === "video",
    },
    {
      name: "load YouTube videos from channel",
      check: query => YOUTUBE_CHANNEL_REGEX.test(query),
    },
    {
      name: "query YouTube from Spotify song",
      check: query => play.sp_validate(query) === "track",
    },
    {
      name: "query YouTube from Spotify album/playlist",
      check: query =>
        ["album", "playlist"].includes(play.sp_validate(query) as string),
    },
    {
      name: "load Musescore song",
      check: query => MUSESCORE_REGEX.test(query),
    },
    {
      name: "load song from url",
      check: query => URL_REGEX.test(query),
    },
    {
      name: "query YouTube",
      check: () => true,
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

  return { plan, time: performance.now() - start };
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
    } else {
      text += `${word} `;
    }
  }

  if (text) {
    queries.push(...text.trim().split("\n"));
  }

  return queries;
}

export async function getSongsFromQuery(query: string) {
  const queries = query ? splitQueries(query) : [];

  const songs: SongType[] = [];
  const songsCache = new Map<string, SongType[]>();
  const play = await getPlayDl(true);

  const matchers: Array<{
    name: string;
    check: (query: string) => Awaitable<boolean>;
    getSongs: (query: string) => Awaitable<SongType[]>;
  }> = [
    {
      name: "YouTube playlist url",
      check: query => play.yt_validate(query) === "playlist",
      async getSongs(query) {
        const id = play.extractID(query);
        const { songs } = await YouTubeSong.fromPlaylistId(id);
        return songs;
      },
    },
    {
      name: "YouTube video url",
      check: query => play.yt_validate(query) === "video",
      async getSongs(query) {
        const song = await YouTubeSong.fromURL(query);
        return [song];
      },
    },
    {
      name: "YouTube channel url",
      check: query => YOUTUBE_CHANNEL_REGEX.test(query),
      async getSongs(query) {
        const id = YOUTUBE_CHANNEL_REGEX.exec(query)?.[2] || "";
        const videos = await YouTubeSong.fromChannelId(id);
        return videos;
      },
    },
    {
      name: "Spotify song url",
      check: query => play.sp_validate(query) === "track",
      async getSongs(query) {
        const song = await SpotifySong.fromURL(query);
        return [song];
      },
    },
    {
      name: "Spotify album/playlist url",
      check: query =>
        ["album", "playlist"].includes(play.sp_validate(query) as string),
      async getSongs(query) {
        const songs = await SpotifySong.fromListURL(query);
        return songs;
      },
    },
    {
      name: "Musescore song",
      check: query => MUSESCORE_REGEX.test(query),
      async getSongs(query) {
        const song = await MusescoreSong.fromURL(query);
        return [song];
      },
    },
    {
      name: "song url",
      check: query => URL_REGEX.test(query),
      getSongs(query) {
        const song = URLSong.fromURL(query);
        return [song];
      },
    },
    {
      name: "YouTube query",
      check: () => true,
      async getSongs(query) {
        const song = await YouTubeSong.fromSearch(query);
        return [song];
      },
    },
  ];

  const errors: Array<{
    index: number;
    name: string;
    query: string;
  }> = [];
  for (const [index, query] of queries.entries()) {
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
          errors.push({ index, name, query });
        }
      }
    }
  }

  return { songs, errors };
}
