import { customsearch } from "@googleapis/customsearch";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { env } from "node:process";

export const api = customsearch({
  version: "v1",
  auth: env.GOOGLE_APIS_KEY,
});

export async function searchImage(query: string, start: number) {
  const result = await api.cse.list({
    q: query,
    cx: env.CUSTOM_SEARCH_ID,
    searchType: "image",
    imgSize: "medium",
    num: 1,
    start,
  });
  const item = result.data.items?.[0];
  if (!item?.link) {
    throw new Error("No results");
  }
  return item.link;
}

export async function buildMessage(query: string, start: number) {
  const url = await searchImage(query, start);

  const embed = new EmbedBuilder()
    .setDescription(query)
    .setColor(env.COLOR)
    .setImage(url);

  const previousButton = new ButtonBuilder()
    .setCustomId("img_prev")
    .setEmoji("⬅️")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(start === 1);
  const nextButton = new ButtonBuilder()
    .setCustomId("img_next")
    .setEmoji("➡️")
    .setStyle(ButtonStyle.Primary);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    previousButton,
    nextButton,
  );

  return {
    embeds: [embed],
    components: [row],
  };
}
