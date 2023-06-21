import {
	type BaseMessageOptions,
	type MessagePayload,
	hyperlink,
	userMention,
} from "discord.js";
import db, { sql, inArray, type InferModel } from "database/drizzle";
import { type files } from "database/drizzle/schema";
import { createEmbed } from "$services/embed";

export const types = ["image", "video", "audio"] as const;
export type Type = (typeof types)[number];
export const extensions: Record<Type, string[]> = {
	image: ["jpg", "jpeg", "png", "gif", "webp"],
	video: ["mp4", "mov", "mkv", "webm"],
	audio: ["mp3", "wav", "ogg"],
};

export async function getRandomFile(type?: Type) {
	const file = await db.query.files.findFirst({
		where: table =>
			inArray(table.ext, type ? extensions[type].map(ext => `.${ext}`) : []),
		orderBy: sql`rand()`,
	});
	return file;
}

export async function sendFile(
	replyable: {
		reply(options: MessagePayload | BaseMessageOptions): Promise<any>;
	},
	{
		createdAt,
		ext,
		authorId,
		messageId,
		channelId,
		guildId,
		proxyUrl,
	}: InferModel<typeof files>
) {
	const embed = createEmbed()
		.setFields(
			{
				name: "Sent by",
				value: userMention(authorId.toString()),
			},
			{
				name: "Where",
				value: hyperlink(
					"Original message",
					`https://discord.com/channels/${guildId}/${channelId}/${messageId}`
				),
				inline: true,
			}
		)
		.setTimestamp(createdAt);
	const extension = ext.replace(".", "");
	if (extensions.image.includes(extension)) {
		embed.setImage(proxyUrl);
		return replyable.reply({
			embeds: [embed],
		});
	}

	return replyable.reply({
		embeds: [embed],
		files: [proxyUrl],
	});
}
