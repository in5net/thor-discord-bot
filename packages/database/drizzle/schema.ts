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
	type MySqlColumn,
} from "drizzle-orm/mysql-core";

export { createId as cuid2 } from "@paralleldrive/cuid2";

const namedIndex = (column: MySqlColumn, ...columns: MySqlColumn[]) =>
	index(
		`${column.uniqueName?.replace(`_${column.name}_unique`, "")}_${[
			column,
			...columns,
		]
			.map(column => column.name)
			.join("_")}_idx`,
	).on(column, ...columns);

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

export const ratios = mysqlTable("ratios", {
	id: varchar("id", { length: 191 }).primaryKey(),
	createdAt,
	content: varchar("content", { length: 191 }).notNull().unique(),
});

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
		userIndex: namedIndex(table.userId),
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
		createdAtIndex: namedIndex(table.createdAt),
		nameIndex: namedIndex(table.name),
		messageIdIndex: namedIndex(table.messageId),
		channelIdIndex: namedIndex(table.channelId),
	}),
);
