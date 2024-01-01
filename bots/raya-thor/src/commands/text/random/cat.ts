import { EmbedBuilder } from "discord.js";
import command from "discord/commands/text";
import got from "got";
import { z } from "zod";

const dataSchema = z.array(
	z.object({
		id: z.string(),
		url: z.string(),
		width: z.number(),
		height: z.number(),
	}),
);

export default command(
	{
		desc: "Sends a random cat",
		args: {},
	},
	async ({ message }) => {
		const data = await got("https://api.thecatapi.com/v1/images/search").json();
		const [cat] = dataSchema.parse(data);
		if (!cat) throw new Error("No cat found");

		const embed = new EmbedBuilder()
			.setTitle("Cat")
			.setColor("#D24515")
			.setImage(cat.url)
			.setFooter({
				text: "Powered by The Cat API",
				iconURL: "https://thecatapi.com/favicon.ico",
			});
		await message.reply({ embeds: [embed] });
	},
);
