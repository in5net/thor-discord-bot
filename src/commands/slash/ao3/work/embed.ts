import {
  categories,
  contentWarnings,
  query,
  ratings,
  type User,
  type Work,
} from "../api";
import { createEmbedBuilder } from "../embed";
import { env } from "node:process";

export function createWorkEmbedBuilder(
  {
    id,
    title,
    author,
    rating,
    warnings,
    categories: workCategories,
    relationships,
    characters,
    tags,
    language,
    series,
    stats: { published, updated, words, chapters, kudos, bookmarks, hits },
    symbols,
  }: Work,
  { url: authorURL, iconURL }: User,
) {
  const embed = createEmbedBuilder()
    .setTitle(title)
    .setAuthor({ name: author, url: authorURL, iconURL })
    .setURL(`${query}${id}`)
    .setThumbnail(
      `https://${env.FILES_DOMAIN}/ao3/squares/${symbols.rating}_${symbols.category}_${symbols.warning}_${symbols.complete}.png`,
    );
  if (rating) {
    embed.addFields({ name: "Rating", value: ratings[rating] });
  }
  if (warnings.length) {
    embed.addFields({
      name: "Warnings",
      value: warnings.map(warning => contentWarnings[warning]).join(", "),
    });
  }
  if (workCategories.length) {
    embed.addFields({
      name: "Categories",
      value: workCategories.map(category => categories[category]).join(", "),
    });
  }
  if (relationships.length) {
    embed.addFields({ name: "Relationships", value: relationships.join(", ") });
  }
  if (characters.length) {
    embed.addFields({ name: "Characters", value: characters.join(", ") });
  }
  if (tags.length) {
    embed.addFields({ name: "Tags", value: tags.join(", ") });
  }
  embed.addFields({ name: "Language", value: language });
  if (series) {
    embed.addFields({
      name: "Series",
      value: `[${series.title}](https://archiveofourown.org/series/${series.id})`,
    });
  }

  embed.addFields({
    name: "Stats:",
    value: `* Published: ${published.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })}${
      updated ?
        `
* Updated: ${updated.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}`
      : ""
    }
* Words: ${words}
* Chapters: ${chapters[0]}/${chapters[1] || "?"}
* Kudos: ${kudos}
* Bookmarks: ${bookmarks}
* Hits: ${hits}`,
  });
  return embed;
}
