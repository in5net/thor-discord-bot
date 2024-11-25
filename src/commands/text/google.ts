import { api } from "$lib/customsearch";
import command from "$lib/discord/commands/text";
import { EmbedBuilder, hyperlink } from "discord.js";
import { env } from "node:process";

export default command(
  {
    aliases: ["g", "gg", "abc", "goog"],
    desc: "Google Search",
    args: {
      query: {
        type: "text",
        desc: "What to search for",
      },
    },
    examples: ["google how to make string cheese"],
  },
  async ({ message, args: { query } }) => {
    const result = await api.cse.list({
      q: query,
      cx: env.CUSTOM_SEARCH_ID,
      num: 5,
    });
    const { items = [] } = result.data;
    const embed = new EmbedBuilder()
      .setTitle(`Search results`)
      .setDescription(query)
      .setColor(env.COLOR)
      .addFields(
        items.map(({ title, link }, i) => ({
          name: `${i + 1}.`,
          value: title && link ? hyperlink(title, link) : "Unknown",
        })),
      );
    await message.channel.send({ embeds: [embed] });
  },
);
