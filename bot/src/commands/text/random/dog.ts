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
		desc: "Sends a random dog",
		args: {},
	},
	async ({ message }) => {
		const data = await got("https://api.thedogapi.com/v1/images/search").json();
		const [dog] = dataSchema.parse(data);
		if (!dog) throw new Error("No dog found");

		const embed = new EmbedBuilder()
			.setTitle("Dog")
			.setColor("#2470D7")
			.setImage(dog.url)
			.setFooter({
				text: "Powered by The Dog API",
				iconURL: "https://thedogapi.com/favicon.ico",
			});
		return message.reply({ embeds: [embed] });
	},
);
