import { ChannelType, type ColorResolvable, EmbedBuilder } from "discord.js";
import command from "discord/commands/slash";
import got from "got";
import { incCount } from "$services/users";

interface TagModel {
	/** Tag Id */
	tag_id: number;
	/** Name */
	name: string;
	/** Description */
	description: string;
	/**
	 * Is Nsfw
	 * @default false
	 */
	is_nsfw?: boolean;
}

interface Data {
	images: Array<{
		/** Signature */
		signature: string;
		/** Extension */
		extension: string;
		/** Image Id */
		image_id: number;
		/** Favourites */
		favourites: number;
		/** Dominant Color */
		dominant_color: string;
		/** Source */
		source?: string;
		/** Uploaded At */
		uploaded_at: string;
		/**
		 * Is Nsfw
		 * @default false
		 */
		is_nsfw?: boolean;
		/** Width */
		width: number;
		/** Height */
		height: number;
		/** Url */
		url: string;
		/** Preview Url */
		preview_url: string;
		/** Tags */
		tags: TagModel[];
	}>;
}

export default command(
	{
		desc: "Sends a random waifu.im image",
		options: {
			option: {
				type: "choice",
				desc: "Additional query option",
				choices: {
					gif: "Get a GIF instead of a normal image",
					nsfw: "Get a naughty image",
				},
				optional: true,
			},
		},
	},
	async (i, { option }) => {
		if (
			option === "nsfw" &&
			(i.channel?.type === ChannelType.GuildText ||
				i.channel?.type === ChannelType.GuildAnnouncement ||
				i.channel?.type === ChannelType.GuildVoice) &&
			!i.channel.nsfw
		)
			return i.reply({
				content: "This isn't a nsfw channel you cheeky boi",
				ephemeral: true,
			});
		await i.deferReply();

		const data = await got("https://api.waifu.im/random", {
			searchParams: {
				gif: option === "gif",
				is_nsfw: option === "nsfw" ? "true" : "false",
			},
		}).json<Data>();
		const image = data.images[0];
		if (!image) throw new Error("No waifu found");

		const embed = new EmbedBuilder()
			.setTitle(image.tags.map(t => t.name).join(", "))
			.setURL(image.url)
			.setDescription(image.tags.map(t => t.description).join(", "))
			.setColor(image.dominant_color as ColorResolvable)
			.setImage(image.url)
			.setFooter({
				text: "Powered by waifu.im",
				iconURL: "https://waifu.im/favicon.ico",
			})
			.setTimestamp(new Date(image.uploaded_at));
		if (image.source)
			embed.setAuthor({
				name: image.source,
				url: image.source,
			});

		await i.editReply({ embeds: [embed] });
		return incCount(i.user.id, "weeb");
	},
);
