import db from "$lib/database/drizzle";
import { map } from "@iz7n/std/iter";
import { objectFromEntries } from "@iz7n/std/object";

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
