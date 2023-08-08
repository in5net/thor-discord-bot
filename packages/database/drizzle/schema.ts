import { relations, sql } from "drizzle-orm";
import {
	bigint,
	boolean,
	char,
	datetime,
	int,
	json,
	mysqlEnum,
	mysqlTable,
	primaryKey,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/mysql-core";

export { createId as cuid2 } from "@paralleldrive/cuid2";

export const users = mysqlTable("User", {
	id: char("id", { length: 18 }).primaryKey(),
	createdAt: datetime("createdAt", { fsp: 3 })
		.default(sql`(CURRENT_TIMESTAMP(3))`)
		.notNull(
			),
				updatedAt: datetim
		e("updatedAt", { fsp: 3 }).notNull(),
	counts: json("counts"),
	creditAt: datetime("creditAt", { fsp: 3 }),
	admin: boolean("admin").default(false).notNull(),
});
export const usersRelations = relations(users, ({ many }) => ({
	playlists: many(playlists),
	issues: many(issues),
}));

export const playlists = mysqlTable(
	"Playlist",
	{
		id: varchar("id", { length: 191 }).primaryKey(),
		createdAt: datetime("createdAt", { fsp: 3 })
			.default(sql`(CURRENT_TIMESTAMP(3))`)
			.notNull
				(),
						updatedAt: datet
			ime("updatedAt", { fsp: 3 }).notNull(),
		name: varchar("name", { length: 100 }).notNull(),
		userId: char("userId", { length: 18 }).notNull(),
	},
	table => ({
		userIdNameKey: uniqueIndex("Playlist_userId_name_key").on(
			table.userId,
			table.name,
		),
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

export const albums = mysqlTable("Album", {
	id: varchar("id", { length: 191 }).primaryKey(),
	createdAt: datetime("createdAt", { fsp: 3 })
		.default(sql`(CURRENT_TIMESTAMP(3))`)
		.notNull(
			),
				updatedAt: datetim
		e("updatedAt", { fsp: 3 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	data: json("data").notNull(),
});
export const albumsRelations = relations(albums, ({ many }) => ({
	playlists: many(songs),
	songs: many(albums),
}));

export const songs = mysqlTable("Song", {
	id: varchar("id", { length: 191 }).primaryKey(),
	createdAt: datetime("createdAt", { fsp: 3 })
		.default(sql`(CURRENT_TIMESTAMP(3))`)
		.notNull(
			),
				updatedAt: datetim
		e("updatedAt", { fsp: 3 }).notNull(),
	playlistId: varchar("playlistId", { length: 191 }),
	albumId: varchar("albumId", { length: 191 }),
	title: text("title").notNull(),
	duration: int("duration").notNull(),
	data: json("data").notNull(),
	playlistIndex: int("playlistIndex"),
	albumIndex: int("albumIndex"),
});
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
export const ratios = mysqlTable("Ratio", {
	id: varchar("id", { length: 191 }).primaryKey(),
	createdAt: datetime("createdAt", { fsp: 3 })
		.default(sql`(CURRENT_TIMESTAMP(3))`)
		.notNull(
			),
				content: varchar("
		content", { length: 191 }).notNull().unique(),
});

export const files = mysqlTable("File", {
	id: bigint("id", { mode: "bigint" }).primaryKey(),
	base: varchar("base", { length: 191 }).notNull(),
	name: varchar("name", { length: 191 }).notNull(),
	ext: varchar("ext", { length: 191 }).notNull(),
	authorId: bigint("authorId", { mode: "bigint" }).notNull(),
	messageId: bigint("messageId", { mode: "bigint" }).notNull(),
	channelId: bigint("channelId", { mode: "bigint" }).notNull(),
	guildId: bigint("guildId", { mode: "bigint" }).notNull(),
	proxyUrl: text("proxyURL").notNull(),
	createdAt: datetime("createdAt", { fsp: 3 })
		.default(sql`(CURRENT_TIMESTAMP(3))`)
		.notNull(
			),
			});

			export const y
		7Files = mysqlTable("Y7File", {
	name: varchar("name", { length: 100 }).primaryKey(),
	extension: varchar("extension", { length: 4 }).notNull(),
});

export const chickens = mysqlTable("Chicken", {
	name: varchar("name", { length: 100 }).primaryKey(),
	sentAt: datetime("sentAt", { fsp: 3 }),
});

export const speechBubbles = mysqlTable("SpeechBubble", {
	name: varchar("name", { length: 100 }).primaryKey(),
	sentAt: datetime("sentAt", { fsp: 3 }),
});

export const hopOn = mysqlTable("HopOn", {
	id: varchar("id", { length: 191 }).primaryKey(),
	sentAt: datetime("sentAt", { fsp: 3 }),
});

export const kraccBacc = mysqlTable("KraccBacc", {
	name: varchar("name", { length: 191 }).primaryKey(),
	sentAt: datetime("sentAt", { fsp: 3 }),
});

export const bossFiles = mysqlTable("BossFile", {
	id: varchar("id", { length: 191 }).primaryKey(),
	url: text("url").notNull(),
	sentAt: datetime("sentAt", { fsp: 3 }),
});

export const issues = mysqlTable("Issue", {
	id: int("id").autoincrement().primaryKey(),
	createdAt: datetime("createdAt", { fsp: 3 })
		.default(sql`(CURRENT_TIMESTAMP(3))`)
		.notNull(
			),
				updatedAt: datetim
		e("updatedAt", { fsp: 3 }).notNull(),
	userId: char("userId", { length: 18 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	type: mysqlEnum("type", ["Bug", "Feature", "Enhancement"]).notNull(),
	desc: text("desc").notNull(),
	closedAt: datetime("closedAt", { fsp: 3 }),
	reason: mysqlEnum("reason", ["Completed", "WontFix", "Duplicate", "Invalid"]),
});
export const issuesRelations = relations(issues, ({ one }) => ({
	user: one(users, {
		fields: [issues.userId],
		references: [users.id],
	}),
}));

export const rotatingFood = mysqlTable("RotatingFood", {
	name: varchar("name", { length: 100 }).primaryKey(),
});

export const audioFilters = mysqlTable("AudioFilter", {
	name: varchar("name", { length: 100 }).primaryKey(),
	value: varchar("value", { length: 191 }).notNull(),
});

export const commandExecutions = mysqlTable("CommandExecution", {
	id: varchar("id", { length: 191 }).primaryKey(),
	createdAt: datetime("createdAt", { fsp: 3 })
		.default(sql`(CURRENT_TIMESTAMP(3))`)
		.notNull(
			),
				name: varchar("nam
		e", { length: 191 }).notNull(),
	type: mysqlEnum("type", ["Text", "Slash", "Message"]).notNull(),
	userId: bigint("userId", { mode: "bigint" }).notNull(),
	messageId: bigint("messageId", { mode: "bigint" }),
	channelId: bigint("channelId", { mode: "bigint" }).notNull(),
	guildId: bigint("guildId", { mode: "bigint" }),
});

export const albumsToPlaylists = mysqlTable(
	"_AlbumToPlaylist",
	{
		a: varchar("A", { length: 191 }).notNull(),
		b: varchar("B", { length: 191 }).notNull(),
	},
	table => ({
		abUnique: uniqueIndex("_AlbumToPlaylist_AB_unique").on(table.a, table.b),
		albumToPlaylistAB: primaryKey(table.a, table.b),
	}),
);
export const albumsToPlaylistsRelations = relations(
	albumsToPlaylists,
	({ one }) => ({
		album: one(albums, {
			fields: [albumsToPlaylists.a],
			references: [albums.id],
		}),
		playlist: one(playlists, {
			fields: [albumsToPlaylists.b],
			references: [playlists.id],
		}),
	}),
);
