/* eslint-disable ts/no-use-before-define */
import { createId as cuid2 } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	unique,
	primaryKey,
	numeric,
	type SQLiteColumn,
} from "drizzle-orm/sqlite-core";

const namedIndex = (column: SQLiteColumn, ...columns: SQLiteColumn[]) =>
	index(
		`${column.uniqueName?.replace(`_${column.name}_unique`, "")}_${[
			column,
			...columns,
		]
			.map(column => column.name)
			.join("_")}_idx`,
	).on(column, ...columns);

const boolean = (name: string) => integer(name, { mode: "boolean" });
const timestamp = (name: string) => integer(name, { mode: "timestamp" });

const createdAt = timestamp("created_at").notNull();
const updatedAt = timestamp("updated_at").notNull();

export const guilds = sqliteTable(
	"guilds",
	{
		id: numeric("id").primaryKey(),
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

export const members = sqliteTable(
	"members",
	{
		id: numeric("id").primaryKey(),
		guildId: numeric("guild_id")
			.notNull()
			.references(() => guilds.id, { onDelete: "cascade" }),
		bot: boolean("bot").notNull().default(false),
		removed: boolean("removed").notNull().default(false),
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

export const channels = sqliteTable(
	"channels",
	{
		id: numeric("id").primaryKey(),
		guildId: numeric("guild_id")
			.notNull()
			.references(() => guilds.id, { onDelete: "set null" }),
		nsfw: boolean("nsfw").notNull().default(false),
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
export const messages = sqliteTable(
	"messages",
	{
		id: numeric("id").primaryKey(),
		createdAt: timestamp("timestamp"),
		updatedAt: timestamp("edited_timestamp"),
		authorId: numeric("author_id").notNull(),
		channelId: numeric("channel_id").notNull(),
		guildId: numeric("guild_id"),
		content: text("content").notNull(),
	},
	table => ({
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
export const attachments = sqliteTable(
	"attachments",
	{
		id: numeric("id").primaryKey(),
		messageId: numeric("message_id").references(() => messages.id, {
			onDelete: "set null",
		}),
		channelId: numeric("channel_id").references(() => channels.id, {
			onDelete: "set null",
		}),
		guildId: numeric("guild_id").references(() => guilds.id, {
			onDelete: "set null",
		}),
		filename: text("filename").notNull(),
		ext: text("extension"),
		contentType: text("content_type"),
		bot: boolean("bot").notNull().default(false),
		nsfw: boolean("nsfw").notNull().default(false),
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

export const users = sqliteTable("users", {
	id: numeric("id").primaryKey(),
	createdAt,
	updatedAt,
	counts: text("counts", { mode: "json" }),
	creditAt: timestamp("credit_at"),
	admin: boolean("admin").default(false).notNull(),
});
export const usersRelations = relations(users, ({ many }) => ({
	playlists: many(playlists),
	issues: many(issues),
}));

export const playlists = sqliteTable(
	"playlists",
	{
		id: text("id").primaryKey(),
		createdAt,
		updatedAt,
		userId: numeric("user_id")
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

export const albums = sqliteTable("albums", {
	id: text("id").primaryKey(),
	createdAt,
	updatedAt,
	name: text("name").notNull(),
	data: text("data", { mode: "json" }).notNull(),
});
export const albumsRelations = relations(albums, ({ many }) => ({
	playlists: many(songs),
	songs: many(albums),
}));

export const albumsToPlaylists = sqliteTable(
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

export const songs = sqliteTable(
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
		data: text("data", { mode: "json" }).notNull(),
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

export const ratios = sqliteTable("ratios", {
	id: text("id").primaryKey().$default(cuid2),
	createdAt,
	content: text("content").notNull().unique(),
});

export const y7Files = sqliteTable("y7_files", {
	name: text("name").primaryKey(),
	extension: text("extension").notNull(),
});

export const chickens = sqliteTable("chickens", {
	name: text("name").primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const speechBubbles = sqliteTable("speech_bubbles", {
	name: text("name").primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const hopOns = sqliteTable("hop_ons", {
	id: text("id").primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const kraccBaccVideos = sqliteTable("kracc_bacc_videos", {
	name: text("name").primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const bossFiles = sqliteTable("boss_files", {
	id: text("id").primaryKey(),
	url: text("url").notNull(),
	sentAt: timestamp("sent_at"),
});

export const issues = sqliteTable(
	"issues",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		createdAt,
		updatedAt,
		userId: numeric("user_id").notNull(),
		name: text("name").notNull(),
		type: text("type", { enum: ["bug", "feature", "enhancement"] }).notNull(),
		desc: text("desc").notNull(),
		closedAt: timestamp("closed_at"),
		reason: text("reason", {
			enum: ["completed", "wont_fix", "duplicate", "invalid"],
		}),
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

export const rotatingFood = sqliteTable("rotating_food", {
	name: text("name").primaryKey(),
});

export const audioFilters = sqliteTable("audio_filters", {
	name: text("name").primaryKey(),
	value: text("value").notNull(),
});

export const commandExecutions = sqliteTable(
	"command_executions",
	{
		id: text("id").primaryKey().$default(cuid2),
		createdAt,
		name: text("name").notNull(),
		type: text("type", { enum: ["text", "slash", "message"] }).notNull(),
		userId: numeric("user_id").notNull(),
		messageId: numeric("message_id"),
		channelId: numeric("channel_id").notNull(),
		guildId: numeric("guild_id"),
	},
	table => ({
		createdAtIndex: namedIndex(table.createdAt),
		nameIndex: namedIndex(table.name),
		messageIdIndex: namedIndex(table.messageId),
		channelIdIndex: namedIndex(table.channelId),
	}),
);

export const oneWordStory = sqliteTable("one_word_story", {
	id: integer("id").primaryKey(),
	createdAt,
	updatedAt,
	guildId: numeric("guild_id").notNull(),
	active: boolean("active").notNull().default(true),
});
export const oneWordStoryRelations = relations(
	oneWordStory,
	({ one, many }) => ({
		entries: many(oneWordStoryEntry),
		guild: one(guilds, {
			fields: [oneWordStory.guildId],
			references: [guilds.id],
		}),
	}),
);

export const oneWordStoryEntry = sqliteTable("one_word_story_entry", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	createdAt,
	userId: numeric("user_id").notNull(),
	story: integer("story").notNull(),
	word: text("word").notNull(),
});
export const oneWordStoryEntryRelations = relations(
	oneWordStoryEntry,
	({ one }) => ({
		user: one(users, {
			fields: [oneWordStoryEntry.userId],
			references: [users.id],
		}),
		story: one(oneWordStory, {
			fields: [oneWordStoryEntry.story],
			references: [oneWordStory.id],
		}),
	}),
);

export const youtubeSearches = sqliteTable(
	"youtube_searches",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		guildId: numeric("guild_id").notNull(),
		channelId: numeric("channel_id").notNull(),
		messageId: numeric("message_id").notNull(),
		ids: text("ids").notNull(),
	},
	table => ({
		guildIdChannelIdMessageIdIdx: namedIndex(
			table.guildId,
			table.channelId,
			table.messageId,
		),
	}),
);
