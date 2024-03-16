import { relations } from "drizzle-orm";
import {
	char,
	bigint,
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
	primaryKey,
	serial,
	pgEnum,
	type PgColumn,
} from "drizzle-orm/pg-core";
import { createId as cuid2 } from "@paralleldrive/cuid2";

const namedIndex = (column: PgColumn, ...columns: PgColumn[]) =>
	index(
		`${column.uniqueName?.replace(`_${column.name}_unique`, "")}_${[
			column,
			...columns,
		]
			.map(column => column.name)
			.join("_")}_idx`,
	).on(column, ...columns);

const createdAt = timestamp("created_at").notNull().defaultNow();
const updatedAt = timestamp("updated_at").notNull().defaultNow();

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
		guildId: bigint("guild_id", { mode: "bigint" })
			.notNull()
			.references(() => guilds.id, { onDelete: "set null" }),
		nsfw: boolean("nsfw").notNull().default(false),
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
		authorId: bigint("author_id", { mode: "bigint" }).notNull(),
		channelId: bigint("channel_id", { mode: "bigint" }).notNull(),
		guildId: bigint("guild_id", { mode: "bigint" }),
		content: text("content").notNull(),
		data: jsonb("data").notNull(),
	},
	table => ({
		createdAtIdx: namedIndex(table.createdAt),
		updatedAtIdx: namedIndex(table.updatedAt),
		authorIdIdx: namedIndex(table.authorId),
		channelIdIdx: namedIndex(table.channelId),
		guildIdIdx: namedIndex(table.guildId),
	}),
);
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
export const attachments = pgTable(
	"attachments",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey(),
		messageId: bigint("message_id", { mode: "bigint" }).references(
			() => messages.id,
			{ onDelete: "set null" },
		),
		channelId: bigint("channel_id", { mode: "bigint" }).references(
			() => channels.id,
			{ onDelete: "set null" },
		),
		guildId: bigint("guild_id", { mode: "bigint" }).references(
			() => guilds.id,
			{ onDelete: "set null" },
		),
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
	},
	table => ({
		messageIdIdx: namedIndex(table.messageId),
		channelIdIdx: namedIndex(table.channelId),
		guildIdIdx: namedIndex(table.guildId),
		extIdx: namedIndex(table.ext),
		botIdx: namedIndex(table.bot),
		nsfwIdx: namedIndex(table.nsfw),
		multiIdx: namedIndex(table.ext, table.bot, table.nsfw),
	}),
);
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

export const users = pgTable("users", {
	id: char("id", { length: 18 }).primaryKey(),
	createdAt,
	updatedAt,
	counts: jsonb("counts"),
	creditAt: timestamp("credit_at"),
	admin: boolean("admin").default(false).notNull(),
});
export const usersRelations = relations(users, ({ many }) => ({
	playlists: many(playlists),
	issues: many(issues),
}));

export const playlists = pgTable(
	"playlists",
	{
		id: text("id").primaryKey(),
		createdAt,
		updatedAt,
		userId: char("user_id", { length: 18 })
			.notNull()
			.references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
		name: text("name").notNull(),
	},
	table => ({
		uniqueUserIdName: unique().on(table.userId, table.name),
	}),
);
export const playlistsRelations = relations(playlists, ({ one, many }) => ({
	author: one(users, {
		fields: [playlists.userId],
		references: [users.id],
	}),
	songs: many(songs),
	albums: many(albums),
}));

export const albums = pgTable("albums", {
	id: text("id").primaryKey(),
	createdAt,
	updatedAt,
	name: text("name").notNull(),
	data: jsonb("data").notNull(),
});
export const albumsRelations = relations(albums, ({ many }) => ({
	playlists: many(songs),
	songs: many(albums),
}));

export const albumsToPlaylists = pgTable(
	"albums_to_playlists",
	{
		albumId: text("album_id")
			.notNull()
			.references(() => albums.id, {
				onUpdate: "cascade",
				onDelete: "cascade",
			}),
		playlistId: text("playlist_id")
			.notNull()
			.references(() => playlists.id, {
				onUpdate: "cascade",
				onDelete: "cascade",
			}),
	},
	table => ({
		pk: primaryKey({ columns: [table.albumId, table.playlistId] }),
	}),
);
export const albumsToPlaylistsRelations = relations(
	albumsToPlaylists,
	({ one }) => ({
		album: one(albums, {
			fields: [albumsToPlaylists.albumId],
			references: [albums.id],
		}),
		playlist: one(playlists, {
			fields: [albumsToPlaylists.playlistId],
			references: [playlists.id],
		}),
	}),
);

export const songs = pgTable(
	"songs",
	{
		id: text("id").primaryKey(),
		createdAt,
		updatedAt,
		playlistId: text("playlist_id").references(() => playlists.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		}),
		albumId: text("album_id").references(() => albums.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		}),
		title: text("title").notNull(),
		duration: integer("duration").notNull(),
		data: jsonb("data").notNull(),
		playlistIndex: integer("playlist_index"),
		albumIndex: integer("album_index"),
	},
	table => ({
		playlistIndex: namedIndex(table.playlistId, table.playlistIndex),
		albumIndex: namedIndex(table.albumId, table.albumIndex),
	}),
);
export const songsRelations = relations(songs, ({ one }) => ({
	playlist: one(playlists, {
		fields: [songs.playlistId],
		references: [playlists.id],
	}),
	album: one(albums, {
		fields: [songs.albumId],
		references: [albums.id],
	}),
}));

export const ratios = pgTable("ratios", {
	id: text("id").primaryKey().$default(cuid2),
	createdAt,
	content: text("content").notNull().unique(),
});

export const y7Files = pgTable("y7_files", {
	name: text("name").primaryKey(),
	extension: text("extension").notNull(),
});

export const chickens = pgTable("chickens", {
	name: text("name").primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const speechBubbles = pgTable("speech_bubbles", {
	name: text("name").primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const hopOns = pgTable("hop_ons", {
	id: text("id").primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const kraccBaccVideos = pgTable("kracc_bacc_videos", {
	name: text("name").primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const bossFiles = pgTable("boss_files", {
	id: text("id").primaryKey(),
	url: text("url").notNull(),
	sentAt: timestamp("sent_at"),
});

const issueType = pgEnum("issue_type", ["bug", "feature", "enhancement"]);
const issueReason = pgEnum("issue_reason", [
	"completed",
	"wont_fix",
	"duplicate",
	"invalid",
]);
export const issues = pgTable(
	"issues",
	{
		id: serial("id").primaryKey(),
		createdAt,
		updatedAt,
		userId: char("user_id", { length: 18 }).notNull(),
		name: text("name").notNull(),
		type: issueType("type").notNull(),
		desc: text("desc").notNull(),
		closedAt: timestamp("closed_at"),
		reason: issueReason("reason"),
	},
	table => ({
		userIndex: namedIndex(table.userId),
	}),
);
export const issuesRelations = relations(issues, ({ one }) => ({
	user: one(users, {
		fields: [issues.userId],
		references: [users.id],
	}),
}));

export const rotatingFood = pgTable("rotating_food", {
	name: text("name").primaryKey(),
});

export const audioFilters = pgTable("audio_filters", {
	name: text("name").primaryKey(),
	value: text("value").notNull(),
});

const commandType = pgEnum("command_type", ["text", "slash", "message"]);
export const commandExecutions = pgTable(
	"command_executions",
	{
		id: text("id").primaryKey().$default(cuid2),
		createdAt,
		name: text("name").notNull(),
		type: commandType("type").notNull(),
		userId: bigint("user_id", { mode: "bigint" }).notNull(),
		messageId: bigint("message_id", { mode: "bigint" }),
		channelId: bigint("channel_id", {
			mode: "bigint",
		}).notNull(),
		guildId: bigint("guild_id", { mode: "bigint" }),
	},
	table => ({
		createdAtIndex: namedIndex(table.createdAt),
		nameIndex: namedIndex(table.name),
		messageIdIndex: namedIndex(table.messageId),
		channelIdIndex: namedIndex(table.channelId),
	}),
);
