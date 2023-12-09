import { createId as cuid2 } from "@paralleldrive/cuid2";
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
		userId: char("user_id", { length: 18 })
			.notNull()
			.references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
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
		albumId: varchar("album_id", { length: 191 })
			.notNull()
			.references(() => albums.id, {
				onUpdate: "cascade",
				onDelete: "cascade",
			}),
		playlistId: varchar("playlist_id", { length: 191 })
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

export const songs = mysqlTable(
	"songs",
	{
		id: varchar("id", { length: 191 }).primaryKey(),
		createdAt,
		updatedAt,
		playlistId: varchar("playlist_id", { length: 191 }).references(
			() => playlists.id,
			{ onUpdate: "cascade", onDelete: "cascade" },
		),
		albumId: varchar("album_id", { length: 191 }).references(() => albums.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		}),
		title: text("title").notNull(),
		duration: int("duration", { unsigned: true }).notNull(),
		data: json("data").notNull(),
		playlistIndex: int("playlist_index", { unsigned: true }),
		albumIndex: int("album_index", { unsigned: true }),
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
	id: varchar("id", { length: 191 }).primaryKey().$default(cuid2),
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
		id: varchar("id", { length: 191 }).primaryKey().$default(cuid2),
		createdAt,
		name: varchar("name", { length: 191 }).notNull(),
		type: mysqlEnum("type", ["text", "slash", "message"]).notNull(),
		userId: bigint("user_id", { mode: "bigint", unsigned: true }).notNull(),
		messageId: bigint("message_id", { mode: "bigint", unsigned: true }),
		channelId: bigint("channel_id", {
			mode: "bigint",
			unsigned: true,
		}).notNull(),
		guildId: bigint("guild_id", { mode: "bigint", unsigned: true }),
	},
	table => ({
		createdAtIndex: namedIndex(table.createdAt),
		nameIndex: namedIndex(table.name),
		messageIdIndex: namedIndex(table.messageId),
		channelIdIndex: namedIndex(table.channelId),
	}),
);
