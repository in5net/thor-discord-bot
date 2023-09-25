import { relations } from "drizzle-orm";
import {
	bigint,
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const guilds = pgTable("guilds", {
	id: bigint("id", { mode: "bigint" }).primaryKey(),
	data: jsonb("data").notNull(),
	deleted: boolean("deleted").notNull().default(false),
});
export const guildsRelations = relations(guilds, ({ many }) => ({
	members: many(members),
	channels: many(channels),
	messages: many(messages),
}));

export const members = pgTable("members", {
	id: bigint("id", { mode: "bigint" }).primaryKey(),
	guildId: bigint("guild_id", { mode: "bigint" })
		.notNull()
		.references(() => guilds.id, { onDelete: "cascade" }),
	bot: boolean("bot").notNull().default(false),
	removed: boolean("removed").notNull().default(false),
	data: jsonb("data").notNull(),
});
export const membersRelations = relations(members, ({ one }) => ({
	guild: one(guilds, {
		fields: [members.guildId],
		references: [guilds.id],
	}),
}));

export const channels = pgTable("channels", {
	id: bigint("id", { mode: "bigint" }).primaryKey(),
	guildId: bigint("guild_id", { mode: "bigint" })
		.notNull()
		.references(() => guilds.id, { onDelete: "set null" }),
	nsfw: boolean("nsfw").notNull().default(false),
	data: jsonb("data").notNull(),
	deleted: boolean("deleted").notNull().default(false),
});
export const channelsRelations = relations(channels, ({ one, many }) => ({
	guild: one(guilds, {
		fields: [channels.guildId],
		references: [guilds.id],
	}),
	messages: many(messages),
}));

/**
 * @see https://discord.com/developers/docs/resources/channel#message-object
 */
export const messages = pgTable("messages", {
	id: bigint("id", { mode: "bigint" }).primaryKey(),
	createdAt: timestamp("timestamp"),
	updatedAt: timestamp("edited_timestamp"),
	authorId: bigint("author_id", { mode: "bigint" }).notNull(),
	channelId: bigint("channel_id", { mode: "bigint" }).notNull(),
	guildId: bigint("guild_id", { mode: "bigint" }),
	content: text("content").notNull(),
	data: jsonb("data").notNull(),
});
export const messagesRelations = relations(messages, ({ one, many }) => ({
	channel: one(channels, {
		fields: [messages.channelId],
		references: [channels.id],
	}),
	guild: one(guilds, {
		fields: [messages.guildId],
		references: [guilds.id],
	}),
	attachments: many(attachments),
}));

/**
 * @see https://discord.com/developers/docs/resources/channel#attachment-object
 */
export const attachments = pgTable("attachments", {
	id: bigint("id", { mode: "bigint" }).primaryKey(),
	messageId: bigint("message_id", { mode: "bigint" }).references(
		() => messages.id,
		{ onDelete: "set null" },
	),
	channelId: bigint("channel_id", { mode: "bigint" }).references(
		() => channels.id,
		{ onDelete: "set null" },
	),
	guildId: bigint("guild_id", { mode: "bigint" }).references(() => guilds.id, {
		onDelete: "set null",
	}),
	filename: text("filename").notNull(),
	ext: text("extension"),
	desc: text("description"),
	contentType: text("content_type"),
	size: integer("size").notNull(),
	url: text("url").notNull(),
	proxyUrl: text("proxy_url"),
	width: integer("width"),
	height: integer("height"),
	bot: boolean("bot").notNull().default(false),
	nsfw: boolean("nsfw").notNull().default(false),
	data: jsonb("data").notNull(),
});
export const attachmentsRelations = relations(attachments, ({ one }) => ({
	channel: one(channels, {
		fields: [attachments.channelId],
		references: [channels.id],
	}),
	message: one(messages, {
		fields: [attachments.messageId],
		references: [messages.id],
	}),
	guild: one(guilds, {
		fields: [attachments.guildId],
		references: [guilds.id],
	}),
}));
