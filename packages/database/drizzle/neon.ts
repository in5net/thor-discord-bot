import { relations } from "drizzle-orm";
import {
	bigint,
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	type PgColumn,
} from "drizzle-orm/pg-core";

const namedIndex = (column: PgColumn, ...columns: PgColumn[]) =>
	index(
		`${column.uniqueName?.replace(`_${column.name}_unique`, "")}_${[
			column,
			...columns,
		]
			.map(column => column.name)
			.join("_")}_idx`,
	).on(column, ...columns);

export const guilds = pgTable(
	"guilds",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey(),
		data: jsonb("data").notNull(),
		deleted: boolean("deleted").notNull().default(false),
	},
	table => ({
		deletedIdx: namedIndex(table.deleted),
	}),
);
export const guildsRelations = relations(guilds, ({ many }) => ({
	members: many(members),
	channels: many(channels),
	messages: many(messages),
}));

export const members = pgTable(
	"members",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey(),
		guildId: bigint("guild_id", { mode: "bigint" })
			.notNull()
			.references(() => guilds.id, { onDelete: "cascade" }),
		bot: boolean("bot").notNull().default(false),
		removed: boolean("removed").notNull().default(false),
		data: jsonb("data").notNull(),
	},
	table => ({
		guildIdIdx: namedIndex(table.guildId),
	}),
);
export const membersRelations = relations(members, ({ one }) => ({
	guild: one(guilds, {
		fields: [members.guildId],
		references: [guilds.id],
	}),
}));

export const channels = pgTable(
	"channels",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey(),
		guildId: bigint("guild_id", { mode: "bigint" }).notNull(),
		data: jsonb("data").notNull(),
		deleted: boolean("deleted").notNull().default(false),
	},
	table => ({
		guildIdIdx: namedIndex(table.guildId),
		deletedIdx: namedIndex(table.deleted),
	}),
);
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
export const messages = pgTable(
	"messages",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey(),
		createdAt: timestamp("timestamp"),
		updatedAt: timestamp("edited_timestamp"),
		guildId: bigint("guild_id", { mode: "bigint" }),
		channelId: bigint("channel_id", { mode: "bigint" }).notNull(),
		authorId: bigint("author_id", { mode: "bigint" }).notNull(),
		content: text("content").notNull(),
		data: jsonb("data").notNull(),
		migrated: boolean("migrated").notNull().default(false),
	},
	table => ({
		createdAtIdx: namedIndex(table.createdAt),
		updatedAtIdx: namedIndex(table.updatedAt),
		guildIdIdx: namedIndex(table.guildId),
		channelIdIdx: namedIndex(table.channelId),
		authorIdIdx: namedIndex(table.authorId),
		migratedIdx: namedIndex(table.migrated),
	}),
);
export const messagesRelations = relations(messages, ({ one, many }) => ({
	guild: one(guilds, {
		fields: [messages.guildId],
		references: [guilds.id],
	}),
	channel: one(channels, {
		fields: [messages.channelId],
		references: [channels.id],
	}),
	attachments: many(attachments),
}));

/**
 * @see https://discord.com/developers/docs/resources/channel#attachment-object
 */
export const attachments = pgTable(
	"attachments",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey(),
		messageId: bigint("message_id", { mode: "bigint" }).references(
			() => messages.id,
			{ onDelete: "set null" },
		),
		filename: text("filename").notNull(),
		desc: text("description"),
		contentType: text("content_type"),
		size: integer("size").notNull(),
		url: text("url").notNull(),
		proxyUrl: text("proxy_url"),
		width: integer("width"),
		height: integer("height"),
		bot: boolean("bot").notNull().default(false),
		data: jsonb("data").notNull(),
		ext: text("extension"),
	},
	table => ({
		messageIdIdx: namedIndex(table.messageId),
		botIdx: namedIndex(table.bot),
	}),
);
export const attachmentsRelations = relations(attachments, ({ one }) => ({
	message: one(messages, {
		fields: [attachments.messageId],
		references: [messages.id],
	}),
}));
