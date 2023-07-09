import { EmbedBuilder } from "discord.js";
import command from "discord/commands/slash";
import got from "got";
import { incCount } from "$services/users";

export default command(
	{
		desc: "Sends a random catboy",
		options: {},
	},
	async i => {
		await i.deferReply();
		const embed = await getCatgirlEmbed();
		await i.editReply({ embeds: [embed] });
		return incCount(i.user.id, "weeb");
	}
);

export async function getCatgirlEmbed() {
	const { url } = await got("https://api.waifu.pics/sfw/neko").json<{
		url: string;
	}>();

	return new EmbedBuilder()
		.setTitle("Catboy")
		.setColor("#BCADD9")
		.setImage(url)
		.setFooter({
			text: "Powered by Waifu.pics",
			iconURL: "https://waifu.pics/favicon.png",
		});
}
