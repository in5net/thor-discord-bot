import { env } from "node:process";
import { EmbedBuilder, hyperlink } from "discord.js";
import command from "discord/commands/text";
import { api } from "$services/customsearch";

export default command(
	{
		aliases: ["g", "goog"],
		desc: "Google Search",
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
				}))
			);
		await message.channel.send({ embeds: [embed] });
	}
);
