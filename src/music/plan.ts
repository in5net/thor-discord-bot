import { Awaitable } from "@in5net/std/types";
import { getPlayDl } from "./play";
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
  queries.unshift(...Array.from(attachments.values()).map(a => a.url));

  const cache: string[] = [];
  const play = await getPlayDl(true);

  const matchers: Array<{
    name: string;
    check(query: string): Awaitable<boolean>;
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
    } else text += `${word} `;
  }

  if (text) {
    queries.push(...text.trim().split("\n"));
    text = "";
  }

  return queries;
}
