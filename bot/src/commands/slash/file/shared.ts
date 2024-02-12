import { createEmbed } from "$services/embed";
import { and, discordDb, eq, inArray, not, sql } from "database/drizzle";
import { attachments, messages } from "database/drizzle/discord";
import {
	hyperlink,
	messageLink,
	userMention,
	type BaseMessageOptions,
	type MessagePayload,
} from "discord.js";
import logger from "logger";

export const types = ["image", "video", "audio"] as const;
export type Type = (typeof types)[number];
export const extensions: Record<Type, string[]> = {
	image: ["jpg", "jpeg", "png", "gif", "webp"],
	video: ["mp4", "mov", "mkv", "webm"],
	audio: ["mp3", "wav", "ogg"],
};

export async function getRandomFile(type?: Type) {
	const start = performance.now();
	const [file] = await discordDb
		.select({
			attachment: attachments,
		})
		.from(attachments)
		.innerJoin(
			discordDb
				.select({ id: attachments.id })
				.from(attachments)
				.where(
					and(
						type ? inArray(attachments.ext, extensions[type]) : undefined,
						not(attachments.bot),
						not(attachments.nsfw),
					),
				)
				.orderBy(sql`random()`)
				.limit(1)
				.as("tmp"),
			eq(attachments.id, sql`tmp.id`),
		);
	logger.info(`getRandomFile took ${performance.now() - start}ms`);
	return file?.attachment;
}

export async function sendFile(
	replyable: {
		reply(options: MessagePayload | BaseMessageOptions): Promise<any>;
	},
	{ messageId, url, proxyUrl, ext }: (typeof attachments)["$inferSelect"],
) {
	if (!messageId) return;
	const message = await discordDb.query.messages.findFirst({
		columns: {
			createdAt: true,
			guildId: true,
			channelId: true,
			authorId: true,
		},
		where: eq(messages.id, messageId),
	});
	if (!message) return;
	const { createdAt, guildId, channelId, authorId } = message;

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
					messageLink(`${channelId}`, `${messageId}`, `${guildId}`),
				),
				inline: true,
			},
		)
		.setTimestamp(createdAt);
	const extension = ext || "";
	if (extensions.image.includes(extension)) {
		embed.setImage(proxyUrl);
		return replyable.reply({
			embeds: [embed],
		});
	}

	return replyable.reply({
		embeds: [embed],
		files: [proxyUrl || url],
	});
}
