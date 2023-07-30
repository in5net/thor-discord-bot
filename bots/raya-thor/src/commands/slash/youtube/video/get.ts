import command from "discord/commands/slash";
import logger from "logger";
import { createEmbedBuilder } from "../embed";
import { sec2Str } from "$services/time";
import youtube from "$services/youtube";

export default command(
	{
		desc: "Get information a YouTube video",
		options: {
			url: {
				desc: "The URL of the video",
				type: "string",
			},
		},
	},
	async (i, { url }) => {
		try {
			const {
				basic_info: {
					title,
					channel,
					thumbnail = [],
					short_description: description,
					duration = 0,
					view_count = 0,
					like_count = 0,
				},
			} = await youtube.getBasicInfo(url);

			const embed = createEmbedBuilder()
				.setURL(url)
				.addFields(
					{
						name: "Duration",
						value: sec2Str(duration),
						inline: true,
					},
					{
						name: "Views",
						value: view_count.toLocaleString(),
						inline: true,
					},
					{
						name: "Likes",
						value: like_count.toLocaleString(),
						inline: true,
					},
				);
			if (title) embed.setTitle(title);
			if (channel) embed.setAuthor(channel);
			const thumb = thumbnail[0]?.url;
			if (thumb) embed.setThumbnail(thumb);

			const maxDesc = 1024;
			if (description)
				embed.setDescription(
					description.length < maxDesc
						? description
						: `${description.slice(0, maxDesc - 3)}...`,
				);

			return await i.reply({
				embeds: [embed],
			});
		} catch (error) {
			logger.error(error);
			return i.reply({
				content: "Failed to get YouTube video",
				ephemeral: true,
			});
		}
	},
);
