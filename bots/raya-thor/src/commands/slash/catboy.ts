import CatboyClient from "catboys";
import { EmbedBuilder } from "discord.js";
import command from "discord/commands/slash";
import { incCount } from "$services/users";

const client = new CatboyClient();

export default command(
	{
		desc: "Sends a random catboy",
		options: {},
	},
	async i => {
		await i.deferReply();
		const embed = await getCatboyEmbed();
		await i.editReply({ embeds: [embed] });
		return incCount(i.user.id, "weeb");
	}
);

export async function getCatboyEmbed() {
	const { url, artist, artist_url, source_url } = await client.image();

	const embed = new EmbedBuilder()
		.setTitle("Catboy")
		.setColor("#6839B6")
		.setImage(url)
		.setFooter({
			text: "Powered by catboys.com",
			iconURL: "https://catboys.com/favicon.png",
		});
	if (source_url.startsWith("http")) embed.setURL(source_url);
	if (artist_url.startsWith("http"))
		embed.setAuthor({ name: artist, url: artist_url });
	return embed;
}
