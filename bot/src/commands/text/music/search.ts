import { formatTime } from "$src/lib/time";
import db from "database/drizzle";
import { youtubeSearches } from "database/drizzle/schema";
import { EmbedBuilder } from "discord.js";
import command from "discord/commands/text";
import Innertube from "youtubei.js";
import { z } from "zod";

const videosSchema = z.array(
	z.object({
		id: z.string(),
		title: z.coerce.string(),
		duration: z.object({
			seconds: z.number(),
		}),
	}),
);

const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

export default command(
	{
		desc: "Search for songs on YouTube and play them by reacting",
		args: {
			query: {
				type: "text",
				desc: "The song you want to search for",
			},
		},
		examples: ["fishing music"],
	},
	async ({ message, args: { query } }) => {
		const { guildId, channelId } = message;
		if (!guildId) return;
		const youtube = await Innertube.create();
		const result = await youtube.search(query, { type: "video" });
		const videos = videosSchema.parse(result.videos.slice(0, 5));

		const embed = new EmbedBuilder()
			.setColor("Red")
			.setTitle("Search Results")
			.setDescription(query)
			.setFields(
				videos.map((video, i) => ({
					name: `${i + 1}. ${video.title}`,
					value: `Duration: ${formatTime(video.duration.seconds)}`,
				})),
			)
			.setFooter({
				text: "React with the number of the song you want to play",
			});
		const embedMessage = await message.channel.send({ embeds: [embed] });

		await db.insert(youtubeSearches).values({
			guildId,
			channelId,
			messageId: embedMessage.id,
			ids: videos.map(v => v.id).join(","),
		});

		for (const emoji of numberEmojis) {
			await embedMessage.react(emoji);
		}
	},
);
