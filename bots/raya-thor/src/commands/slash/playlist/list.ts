import { env } from "node:process";
import { EmbedBuilder } from "discord.js";
import command from "discord/commands/slash";
import { list } from "$src/music/playlist";

export default command(
	{
		desc: "Shows a list of your saved playlists",
		options: {},
	},
	async i => {
		const { user } = i;
		const playlists = await list(user.id);
		const desc = playlists.join("\n");
		const embed = new EmbedBuilder()
			.setTitle("Playlists")
			.setColor(env.COLOR)
			.setAuthor({
				name: user.username,
				iconURL: user.avatarURL() || undefined,
			})
			.setDescription(desc.length > 1000 ? `${desc.slice(0, 1000)}...` : desc);
		await i.reply({ embeds: [embed], ephemeral: true });
	}
);
