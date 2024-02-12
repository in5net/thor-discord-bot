import ImageSearch from "$lib/customsearch";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from "discord.js";
import command from "discord/commands/slash";
import ms from "ms";
import { env } from "node:process";

export default command(
	{
		desc: "Google search for an image",
		options: {
			query: {
				type: "string",
				desc: "The image query",
			},
		},
	},
	async (i, { query }) => {
		await i.deferReply();
		const search = new ImageSearch(query);

		const embed = new EmbedBuilder()
			.setDescription(query)
			.setColor(env.COLOR)
			.setImage(await search.next());
		const previousButton = new ButtonBuilder()
			.setCustomId("prev")
			.setEmoji("⬅️")
			.setStyle(ButtonStyle.Primary)
			.setDisabled();
		const nextButton = new ButtonBuilder()
			.setCustomId("next")
			.setEmoji("➡️")
			.setStyle(ButtonStyle.Primary);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			previousButton,
			nextButton,
		);
		await i
			.editReply({
				embeds: [embed],
				components: [row],
			})
			.catch(() => null);

		i.channel
			?.createMessageComponentCollector({
				filter: int => int.user.id === i.user.id,
				time: ms("1 min"),
			})
			.on("collect", async i => {
				try {
					embed.setImage(
						i.customId === "prev" ? await search.prev() : await search.next(),
					);
					previousButton?.setDisabled(!search.hasPrev());
					await i.update({
						embeds: [embed],
						components: [row],
					});
				} catch {
					await i.editReply("Some error occurred...imagine").catch(() => null);
				}
			})
			.once("end", async () => {
				await i.followUp("Ran out of time ⏱");
			});
	},
);
