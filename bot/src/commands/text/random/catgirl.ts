import { incCount } from "$lib/users";
import { EmbedBuilder } from "discord.js";
import command from "discord/commands/text";
import got from "got";
import { z } from "zod";

export default command(
	{
		desc: "Sends a random catgirl",
		args: {},
	},
	async ({ message }) => {
		const embed = await getCatgirlEmbed();
		await message.reply({ embeds: [embed] });
		await incCount(message.author.id, "weeb");
	},
);

const dataSchema = z.object({
	url: z.string(),
});
export async function getCatgirlEmbed() {
	const data = await got("https://api.waifu.pics/sfw/neko").json();
	const { url } = dataSchema.parse(data);

	return new EmbedBuilder()
		.setTitle("Catgirl")
		.setColor("#BCADD9")
		.setImage(url)
		.setFooter({
			text: "Powered by Waifu.pics",
			iconURL: "https://waifu.pics/favicon.png",
		});
}
