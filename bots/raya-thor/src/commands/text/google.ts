import { api } from "$services/customsearch";
import { EmbedBuilder, hyperlink } from "discord.js";
import command from "discord/commands/text";
import { env } from "node:process";

export default command(
	{
		aliases: ["g", "gg", "abc", "goog"],
		desc: "Google Search",
		examples: ["google how to make string cheese"],
		args: {
			query: {
				type: "text",
				desc: "What to search for",
			},
		},
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
