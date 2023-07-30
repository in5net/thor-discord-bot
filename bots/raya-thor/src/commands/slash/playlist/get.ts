import { env } from "node:process";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
} from "discord.js";
import command from "discord/commands/slash";
import ms from "ms";
import db, { and, eq, icontains } from "database/drizzle";
import { playlists } from "database/drizzle/schema";
import * as playlist from "$src/music/playlist";
import { sec2Str } from "$services/time";

export default command(
	{
		desc: "Shows the songs in your playlist",
		options: {
			name: {
				type: "string",
				desc: "The name of the playlist",
				async autocomplete(search, i) {
					const results = await db.query.playlists.findMany({
						columns: {
							name: true,
						},
						where: and(
							eq(playlists.userId, i.user.id),
							icontains(playlists.name, search),
						),
						orderBy: playlists.name,
						limit: 5,
					});
					return results.map(({ name }) => name);
				},
			},
		},
	},
	async (i, { name }) => {
		const { user } = i;
		const songs = await playlist
			.get(
				{
					uid: user.id,
					name: user.username,
				},
				name,
			)
			.catch(() => []);
		const { length } = songs;

		const embed = new EmbedBuilder()
			.setTitle("Tracks")
			.setColor(env.COLOR)
			.setAuthor({
				name: user.username,
				iconURL: user.avatarURL() || undefined,
			});
		const backButton = new ButtonBuilder()
			.setCustomId("back")
			.setEmoji("⬅️")
			.setStyle(ButtonStyle.Primary);
		const nextButton = new ButtonBuilder()
			.setCustomId("next")
			.setEmoji("➡️")
			.setStyle(ButtonStyle.Primary);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			backButton,
			nextButton,
		);

		let page = 0;
		const pageSize = 5;

		const generateEmbed = () => {
			embed.setFields();
			backButton.setDisabled(!page);
			nextButton.setDisabled(page * pageSize + pageSize >= length);
			embed.setFooter({
				text: `Page ${page + 1}/${Math.ceil(
					length / pageSize,
				)}, total: ${length}`,
			});

			for (let i = page * pageSize; i < (page + 1) * pageSize; i++) {
				const song = songs[i];
				if (!song) break;
				const { title, duration } = song;
				embed.addFields({
					name: `${i + 1}. ${title}`,
					value: duration ? `${sec2Str(duration)}` : "\u200B",
				});
			}
		};

		generateEmbed();

		const message = await i.reply({
			embeds: [embed],
			components: [row],
			ephemeral: true,
		});

		message
			.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: ms("1 min"),
			})
			.on("collect", async i => {
				const { customId } = i;
				if (customId === "back") page--;
				else if (customId === "next") page++;
				generateEmbed();
				await i.editReply({ embeds: [embed], components: [row] });
			});
	},
);
