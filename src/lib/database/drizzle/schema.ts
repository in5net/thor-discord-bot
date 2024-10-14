/* eslint-disable ts/no-use-before-define */
import { createId as cuid2 } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
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
  {
    id: text("id").primaryKey(),
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
    id: text("id").primaryKey(),
    guildId: text("guild_id")
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
    id: text("id").primaryKey(),
    guildId: text("guild_id")
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
  context: many(context),
}));

/**
 * @see https://discord.com/developers/docs/resources/channel#message-object
 */
export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    createdAt: timestamp("timestamp"),
    updatedAt: timestamp("edited_timestamp"),
    authorId: text("author_id").notNull(),
    channelId: text("channel_id").notNull(),
    guildId: text("guild_id"),
    content: text("content").notNull(),
    deleted: boolean("deleted").notNull().default(false),
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
    id: text("id").primaryKey(),
    messageId: text("message_id").references(() => messages.id, {
      onDelete: "set null",
    }),
    channelId: text("channel_id").references(() => channels.id, {
      onDelete: "set null",
    }),
    guildId: text("guild_id").references(() => guilds.id, {
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
  id: text("id").primaryKey(),
  createdAt,
  updatedAt,
  counts: text("counts", { mode: "json" }),
  creditAt: timestamp("credit_at"),
  admin: boolean("admin").default(false).notNull(),
});
export const usersRelations = relations(users, ({ many }) => ({
  issues: many(issues),
  chessGames: many(chessGames),
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
    userId: text("user_id").notNull(),
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
  "$lib/command_executions",
  {
    id: text("id").primaryKey().$default(cuid2),
    createdAt,
    name: text("name").notNull(),
    type: text("type", { enum: ["text", "slash", "message"] }).notNull(),
    userId: text("user_id").notNull(),
    messageId: text("message_id"),
    channelId: text("channel_id").notNull(),
    guildId: text("guild_id"),
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
  guildId: text("guild_id").notNull(),
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
  userId: text("user_id").notNull(),
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
    guildId: text("guild_id").notNull(),
    channelId: text("channel_id").notNull(),
    messageId: text("message_id").notNull(),
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

export const randomResponses = sqliteTable("random_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  words: text("words").notNull(),
  responses: text("responses").notNull(),
  chance: real("chance").notNull().default(1),
  cooldown: integer("cooldown").notNull().default(0),
  sentAt: timestamp("sent_at"),
});

export const themes = sqliteTable("themes", {
  name: text("name").primaryKey(),
  words: text("words", { mode: "json" })
    .notNull()
    .$type<Record<string, string[]>>(),
});

export const context = sqliteTable("context", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt,
  channelId: text("channel_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
});
export const contextRelations = relations(context, ({ one }) => ({
  channel: one(channels, {
    fields: [context.channelId],
    references: [channels.id],
  }),
}));

export const stackItems = sqliteTable("stack_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt,
  value: text("item").notNull(),
});

export const chessGames = sqliteTable("chess_games", {
  userId: text("user_id").primaryKey(),
  createdAt,
  updatedAt,
  fen: text("fen").notNull(),
});
export const chessGamesRelations = relations(chessGames, ({ one }) => ({
  user: one(users, {
    fields: [chessGames.userId],
    references: [users.id],
  }),
}));
