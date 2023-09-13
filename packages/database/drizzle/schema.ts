import { relations, sql } from "drizzle-orm";
import {
	bigint,
	boolean,
	char,
	index,
	int,
	json,
	mysqlEnum,
	mysqlTable,
	primaryKey,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/mysql-core";

export { createId as cuid2 } from "@paralleldrive/cuid2";

const createdAt = timestamp("created_at")
	.notNull()
	.default(sql`CURRENT_TIMESTAMP()`);
const updatedAt = timestamp("updated_at")
	.notNull()
	.default(sql`CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);

export const users = mysqlTable("users", {
	id: char("id", { length: 18 }).primaryKey(),
	createdAt,
	updatedAt,
	counts: json("counts"),
	creditAt: timestamp("credit_at"),
	admin: boolean("admin").default(false).notNull(),
});
export const usersRelations = relations(users, ({ many }) => ({
	playlists: many(playlists),
	issues: many(issues),
}));

export const playlists = mysqlTable(
	"playlists",
	{
		id: varchar("id", { length: 191 }).primaryKey(),
		createdAt,
		updatedAt,
		userId: char("user_id", { length: 18 }).notNull(),
		name: varchar("name", { length: 100 }).notNull(),
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

export const albums = mysqlTable("albums", {
	id: varchar("id", { length: 191 }).primaryKey(),
	createdAt,
	updatedAt,
	name: varchar("name", { length: 100 }).notNull(),
	data: json("data").notNull(),
});
export const albumsRelations = relations(albums, ({ many }) => ({
	playlists: many(songs),
	songs: many(albums),
}));

export const albumsToPlaylists = mysqlTable(
	"albums_to_playlists",
	{
		albumId: varchar("album_id", { length: 191 }).notNull(),
		playlistId: varchar("playlist_id", { length: 191 }).notNull(),
	},
	table => ({
		pk: primaryKey(table.albumId, table.playlistId),
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

export const songs = mysqlTable(
	"songs",
	{
		id: varchar("id", { length: 191 }).primaryKey(),
		createdAt,
		updatedAt,
		playlistId: varchar("playlist_id", { length: 191 }),
		albumId: varchar("album_id", { length: 191 }),
		title: text("title").notNull(),
		duration: int("duration").notNull(),
		data: json("data").notNull(),
		playlistIndex: int("playlist_index"),
		albumIndex: int("album_index"),
	},
	table => ({
		playlistIndex: index("songs_playlist_id_playlist_idx").on(
			table.playlistId,
			table.playlistIndex,
		),
		albumIndex: index("songs_album_id_album_idx").on(
			table.albumId,
			table.albumIndex,
		),
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

export const ratios = mysqlTable("ratios", {
	id: varchar("id", { length: 191 }).primaryKey(),
	createdAt,
	content: varchar("content", { length: 191 }).notNull().unique(),
});

export const files = mysqlTable(
	"files",
	{
		id: bigint("id", { mode: "bigint" }).primaryKey(),
		createdAt,
		base: varchar("base", { length: 191 }).notNull(),
		name: varchar("name", { length: 191 }).notNull(),
		ext: varchar("ext", { length: 191 }).notNull(),
		authorId: bigint("author_id", { mode: "bigint" }).notNull(),
		messageId: bigint("message_id", { mode: "bigint" }).notNull(),
		channelId: bigint("channel_id", { mode: "bigint" }).notNull(),
		guildId: bigint("guild_id", { mode: "bigint" }).notNull(),
		proxyUrl: text("proxy_url").notNull(),
	},
	table => ({
		createdAtIndex: index("files_created_at_idx").on(table.createdAt),
		baseIndex: index("files_base_idx").on(table.base),
		nameIndex: index("files_name_idx").on(table.name),
		extIndex: index("files_ext_idx").on(table.ext),
		authorIdIndex: index("files_author_id_idx").on(table.authorId),
		messageIdIndex: index("files_message_id_idx").on(table.messageId),
		channelIdIndex: index("files_channel_id_idx").on(table.channelId),
		guildIdIndex: index("files_guild_id_idx").on(table.guildId),
	}),
);

export const y7Files = mysqlTable("y7_files", {
	name: varchar("name", { length: 100 }).primaryKey(),
	extension: varchar("extension", { length: 4 }).notNull(),
});

export const chickens = mysqlTable("chickens", {
	name: varchar("name", { length: 100 }).primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const speechBubbles = mysqlTable("speech_bubbles", {
	name: varchar("name", { length: 100 }).primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const hopOns = mysqlTable("hop_ons", {
	id: varchar("id", { length: 191 }).primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const kraccBaccVideos = mysqlTable("kracc_bacc_videos", {
	name: varchar("name", { length: 191 }).primaryKey(),
	sentAt: timestamp("sent_at"),
});

export const bossFiles = mysqlTable("boss_files", {
	id: varchar("id", { length: 191 }).primaryKey(),
	url: text("url").notNull(),
	sentAt: timestamp("sent_at"),
});

export const issues = mysqlTable(
	"issues",
	{
		id: int("id").primaryKey().autoincrement(),
		createdAt,
		updatedAt,
		userId: char("user_id", { length: 18 }).notNull(),
		name: varchar("name", { length: 100 }).notNull(),
		type: mysqlEnum("type", ["bug", "feature", "enhancement"]).notNull(),
		desc: text("desc").notNull(),
		closedAt: timestamp("closed_at"),
		reason: mysqlEnum("reason", [
			"completed",
			"wont_fix",
			"duplicate",
			"invalid",
		]),
	},
	table => ({
		userIndex: index("issues_user_id_idx").on(table.userId),
	}),
);
export const issuesRelations = relations(issues, ({ one }) => ({
	user: one(users, {
		fields: [issues.userId],
		references: [users.id],
	}),
}));

export const rotatingFood = mysqlTable("rotating_food", {
	name: varchar("name", { length: 100 }).primaryKey(),
});

export const audioFilters = mysqlTable("audio_filters", {
	name: varchar("name", { length: 100 }).primaryKey(),
	value: varchar("value", { length: 191 }).notNull(),
});

export const commandExecutions = mysqlTable(
	"command_executions",
	{
		id: varchar("id", { length: 191 }).primaryKey(),
		createdAt,
		name: varchar("name", { length: 191 }).notNull(),
		type: mysqlEnum("type", ["text", "slash", "message"]).notNull(),
		userId: bigint("user_id", { mode: "bigint" }).notNull(),
		messageId: bigint("message_id", { mode: "bigint" }),
		channelId: bigint("channel_id", { mode: "bigint" }).notNull(),
		guildId: bigint("guild_id", { mode: "bigint" }),
	},
	table => ({
		createdAtIndex: index("command_executions_created_at_idx").on(
			table.createdAt,
		),
		nameIndex: index("command_executions_name_idx").on(table.name),
		messageIdIndex: index("command_executions_message_id_idx").on(
			table.messageId,
		),
		channelIdIndex: index("command_executions_channel_id_idx").on(
			table.channelId,
		),
	}),
);

export const guilds = mysqlTable("guilds", {
	id: bigint("id", { mode: "bigint" }).primaryKey(),
	data: json("data").notNull(),
	deleted: boolean("deleted").notNull().default(false),
});
export const guildsRelations = relations(guilds, ({ many }) => ({
	channels: many(channels),
	messages: many(messages),
}));

export const channels = mysqlTable("channels", {
	id: bigint("id", { mode: "bigint" }).primaryKey(),
	guildId: bigint("guild_id", { mode: "bigint" }),
	data: json("data").notNull(),
	deleted: boolean("deleted").notNull().default(false),
});
export const channelsRelations = relations(channels, ({ one, many }) => ({
	guild: one(guilds, {
		fields: [channels.guildId],
		references: [guilds.id],
	}),
	messages: many(messages),
}));

export const messages = mysqlTable("messages", {
	id: bigint("id", { mode: "bigint" }).primaryKey(),
	guildId: bigint("guild_id", { mode: "bigint" }),
	channelId: bigint("channel_id", { mode: "bigint" }),
	authorId: bigint("author_id", { mode: "bigint" }),
	data: json("data").notNull(),
	deleted: boolean("deleted").notNull().default(false),
});
export const messagesRelations = relations(messages, ({ one }) => ({
	guild: one(guilds, {
		fields: [messages.guildId],
		references: [guilds.id],
	}),
	channel: one(channels, {
		fields: [messages.channelId],
		references: [channels.id],
	}),
}));
