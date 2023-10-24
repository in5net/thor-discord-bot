import { EmbedBuilder } from "discord.js";
import command from "discord/commands/text";
import got from "got";

type Data = Array<{
	breeds: string[];
	id: string;
	url: string;
	width: number;
	height: number;
}>;

export default command(
	{
		desc: "Sends a random cat",
		args: {},
	},
	async ({ message }) => {
		const [cat] = await got(
			"https://api.thecatapi.com/v1/images/search",
		).json<Data>();
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
