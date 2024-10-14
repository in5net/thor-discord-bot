import { incCount } from "$lib/users";
import { EmbedBuilder } from "discord.js";
import command from "$lib/discord/commands/slash";
import { fetchRandom, type NB_CATEGORIES } from "nekos-best.js";

const CATEGORIES: NB_CATEGORIES[] = [
  "baka",
  "blush",
  "bored",
  "cry",
  "cuddle",
  "dance",
  "happy",
  "highfive",
  "hug",
  "kiss",
  "laugh",
  "neko",
  "pat",
  "pout",
  "sleep",
  "smile",
  "smug",
  "think",
  "thumbsup",
  "tickle",
  "wave",
  "wink",
  "waifu",
  "handhold",
  "shoot",
];

export default command(
  {
    desc: "Sends a random nekos.best image",
    options: {
      category: {
        type: "choice",
        desc: "Category in which the image will be in",
        choices: CATEGORIES,
        default: "neko",
      },
    },
  },
  async (i, { category }) => {
    await i.deferReply();
    const {
      results: [result],
    } = await fetchRandom(category);
    if (!result) return i.editReply("No results found");

    const {
      url,
      artist_name = "Unknown",
      artist_href,
      source_url,
      anime_name,
    } = result;
    const embed = new EmbedBuilder()
      .setColor("#ff0266")
      .setImage(url)
      .setAuthor({ name: artist_name, url: artist_href })
      .setFooter({
        text: "Powered by nekos.best",
        iconURL: "https://nekos.best/favicon.png",
      });
    if (source_url) embed.setURL(source_url);
    if (anime_name) embed.setTitle(anime_name);

    await i.editReply({ embeds: [embed] });
    return incCount(i.user.id, "weeb");
  },
);
