/* eslint-disable ts/no-use-before-define */
import type { PlaylistItemJSON } from "$src/music/songs";
import { createId as cuid2 } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
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

const createdAt = timestamp("created_at")
  .notNull()
  .default(sql`(CURRENT_TIMESTAMP)`);
const updatedAt = timestamp("updated_at")
  .notNull()
  .default(sql`(CURRENT_TIMESTAMP)`);

export const guilds = sqliteTable(
  "guilds",
  t => ({
    id: t.text().primaryKey(),
    deleted: boolean("deleted").notNull().default(false),
  }),
  t => [namedIndex(t.deleted)],
);
export const guildsRelations = relations(guilds, ({ many }) => ({
  members: many(members),
  channels: many(channels),
  messages: many(messages),
}));

export const members = sqliteTable(
  "members",
  t => ({
    id: t.text().primaryKey(),
    guildId: t
      .text()
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    bot: boolean("bot").notNull().default(false),
    removed: boolean("removed").notNull().default(false),
  }),
  t => [namedIndex(t.guildId)],
);
export const membersRelations = relations(members, ({ one }) => ({
  guild: one(guilds, {
    fields: [members.guildId],
    references: [guilds.id],
  }),
}));

export const channels = sqliteTable(
  "channels",
  t => ({
    id: t.text().primaryKey(),
    guildId: t
      .text()
      .notNull()
      .references(() => guilds.id, { onDelete: "set null" }),
    nsfw: boolean("nsfw").notNull().default(false),
    deleted: boolean("deleted").notNull().default(false),
  }),
  t => [namedIndex(t.guildId), namedIndex(t.deleted)],
);
export const channelsRelations = relations(channels, ({ one, many }) => ({
  guild: one(guilds, {
    fields: [channels.guildId],
    references: [guilds.id],
  }),
  messages: many(messages),
  context: many(context),
}));

/**
 * @see https://discord.com/developers/docs/resources/channel#message-object
 */
export const messages = sqliteTable(
  "messages",
  t => ({
    id: t.text().primaryKey(),
    createdAt: timestamp("timestamp"),
    updatedAt: timestamp("edited_timestamp"),
    authorId: t.text().notNull(),
    channelId: t.text().notNull(),
    guildId: t.text(),
    content: t.text().notNull(),
    deleted: boolean("deleted").notNull().default(false),
  }),
  t => [namedIndex(t.authorId), namedIndex(t.channelId), namedIndex(t.guildId)],
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
  t => ({
    id: t.text().primaryKey(),
    messageId: t.text().references(() => messages.id, {
      onDelete: "set null",
    }),
    channelId: t.text().references(() => channels.id, {
      onDelete: "set null",
    }),
    guildId: t.text().references(() => guilds.id, {
      onDelete: "set null",
    }),
    filename: t.text().notNull(),
    ext: t.text(),
    contentType: t.text(),
    bot: boolean("bot").notNull().default(false),
    nsfw: boolean("nsfw").notNull().default(false),
  }),
  t => [
    namedIndex(t.messageId),
    namedIndex(t.channelId),
    namedIndex(t.guildId),
    namedIndex(t.ext),
    namedIndex(t.bot),
    namedIndex(t.nsfw),
    namedIndex(t.ext, t.bot, t.nsfw),
  ],
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

export const users = sqliteTable("users", t => ({
  id: t.text().primaryKey(),
  createdAt,
  updatedAt,
  counts: t.text({ mode: "json" }),
  creditAt: timestamp("credit_at"),
  admin: boolean("admin").default(false).notNull(),
}));
export const usersRelations = relations(users, ({ many }) => ({
  issues: many(issues),
  chessGames: many(chessGames),
}));

export const playlists = sqliteTable(
  "playlists",
  t => ({
    id: t.text().primaryKey().$default(cuid2),
    createdAt,
    userId: t
      .text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: t.text().notNull(),
    songs: t.text({ mode: "json" }).notNull().$type<PlaylistItemJSON[]>(),
  }),
  t => [namedIndex(t.userId, t.name)],
);
export const playlistsRelations = relations(playlists, ({ one }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
}));

export const ratios = sqliteTable("ratios", t => ({
  id: t.text().primaryKey().$default(cuid2),
  createdAt,
  content: t.text().notNull().unique(),
}));

export const files = sqliteTable("files", t => ({
  id: t.text().primaryKey(),
  path: t.text().notNull(),
  name: t.text().notNull(),
  ext: t.text().notNull(),
  nsfw: boolean("nsfw").notNull().default(false),
  sentAt: timestamp("sent_at"),
}));
export const filesRelations = relations(files, ({ many }) => ({
  tags: many(fileTags),
}));

export const fileTags = sqliteTable(
  "file_tags",
  t => ({
    id: t.integer().primaryKey({ autoIncrement: true }),
    fileId: t
      .text()
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    name: t.text().notNull(),
  }),
  t => [namedIndex(t.name, t.fileId)],
);
export const fileTagsRelations = relations(fileTags, ({ one }) => ({
  file: one(files, {
    fields: [fileTags.fileId],
    references: [files.id],
  }),
}));

export const hopOns = sqliteTable("hop_ons", t => ({
  id: t.text().primaryKey(),
  sentAt: timestamp("sent_at"),
}));

export const issues = sqliteTable(
  "issues",
  t => ({
    id: t.integer().primaryKey({ autoIncrement: true }),
    createdAt,
    updatedAt,
    userId: t.text().notNull(),
    name: t.text().notNull(),
    type: t.text("type", { enum: ["bug", "feature", "enhancement"] }).notNull(),
    desc: t.text().notNull(),
    closedAt: timestamp("closed_at"),
    reason: t.text({
      enum: ["completed", "wont_fix", "duplicate", "invalid"],
    }),
  }),
  t => [namedIndex(t.userId)],
);
export const issuesRelations = relations(issues, ({ one }) => ({
  user: one(users, {
    fields: [issues.userId],
    references: [users.id],
  }),
}));

export const audioFilters = sqliteTable("audio_filters", t => ({
  name: t.text().primaryKey(),
  value: t.text().notNull(),
}));

export const commandExecutions = sqliteTable(
  "command_executions",
  t => ({
    id: t.text().primaryKey().$default(cuid2),
    createdAt,
    name: t.text().notNull(),
    type: t.text({ enum: ["text", "slash", "message"] }).notNull(),
    userId: t.text().notNull(),
    messageId: t.text(),
    channelId: t.text().notNull(),
    guildId: t.text(),
  }),
  t => [
    namedIndex(t.createdAt),
    namedIndex(t.name),
    namedIndex(t.messageId),
    namedIndex(t.channelId),
  ],
);

export const oneWordStory = sqliteTable("one_word_story", t => ({
  id: t.integer("id").primaryKey(),
  createdAt,
  updatedAt,
  guildId: t.text().notNull(),
  active: boolean("active").notNull().default(true),
}));
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

export const oneWordStoryEntry = sqliteTable("one_word_story_entry", t => ({
  id: t.integer().primaryKey({ autoIncrement: true }),
  createdAt,
  userId: t.text().notNull(),
  story: t.integer().notNull(),
  word: t.text().notNull(),
}));
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

export const imageSearches = sqliteTable("image_searches", t => ({
  messageId: t.text().primaryKey(),
  query: t.text().notNull(),
  start: t.integer().notNull(),
}));
export const imageSearchesRelations = relations(imageSearches, ({ one }) => ({
  message: one(messages, {
    fields: [imageSearches.messageId],
    references: [messages.id],
  }),
}));

export const youtubeSearches = sqliteTable(
  "youtube_searches",
  t => ({
    id: t.integer().primaryKey({ autoIncrement: true }),
    guildId: t.text().notNull(),
    channelId: t.text().notNull(),
    messageId: t.text().notNull(),
    ids: t.text().notNull(),
  }),
  t => [namedIndex(t.guildId, t.channelId, t.messageId)],
);

export const randomResponses = sqliteTable("random_responses", t => ({
  id: t.integer().primaryKey({ autoIncrement: true }),
  words: t.text().notNull(),
  responses: t.text().notNull(),
  chance: t.real().notNull().default(1),
  cooldown: integer().notNull().default(0),
  sentAt: timestamp("sent_at"),
}));

export const themes = sqliteTable("themes", t => ({
  name: t.text().primaryKey(),
  words: t.text({ mode: "json" }).notNull().$type<Record<string, string[]>>(),
}));

export const context = sqliteTable("context", t => ({
  id: t.integer().primaryKey({ autoIncrement: true }),
  createdAt,
  channelId: t.text().notNull(),
  question: t.text().notNull(),
  answer: t.text().notNull(),
}));
export const contextRelations = relations(context, ({ one }) => ({
  channel: one(channels, {
    fields: [context.channelId],
    references: [channels.id],
  }),
}));

export const stackItems = sqliteTable("stack_items", t => ({
  id: t.integer().primaryKey({ autoIncrement: true }),
  createdAt,
  value: t.text().notNull(),
}));

export const chessGames = sqliteTable("chess_games", t => ({
  userId: t.text().primaryKey(),
  createdAt,
  updatedAt,
  fen: t.text().notNull(),
}));
export const chessGamesRelations = relations(chessGames, ({ one }) => ({
  user: one(users, {
    fields: [chessGames.userId],
    references: [users.id],
  }),
}));

export const kv = sqliteTable("kv", t => ({
  key: t.text().primaryKey(),
  value: t.text().notNull(),
}));
