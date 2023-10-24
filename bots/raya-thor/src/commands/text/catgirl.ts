import { incCount } from "$services/users";
import { EmbedBuilder } from "discord.js";
import command from "discord/commands/text";
import got from "got";

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

export async function getCatgirlEmbed() {
	const { url } = await got("https://api.waifu.pics/sfw/neko").json<{
		url: string;
	}>();

	return new EmbedBuilder()
		.setTitle("Catgirl")
		.setColor("#BCADD9")
		.setImage(url)
		.setFooter({
			text: "Powered by Waifu.pics",
			iconURL: "https://waifu.pics/favicon.png",
		});
}
