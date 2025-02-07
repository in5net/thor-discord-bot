import db from "$lib/database/drizzle";
import { map } from "@in5net/std/iter";
import { objectFromEntries } from "@in5net/std/object";

export async function getRandomResponses() {
  const randomResponses = await db.query.randomResponses.findMany();
  return randomResponses.map(({ words, responses, ...data }) => ({
    ...data,
    words: words.split("|"),
    responses: responses.split("|"),
  }));
}

export async function getThemes() {
  const themes = await db.query.themes.findMany();
  return objectFromEntries(map(themes, ({ name, words }) => [name, words]));
}
