CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text,
	`channel_id` text,
	`guild_id` text,
	`filename` text NOT NULL,
	`ext` text,
	`content_type` text,
	`bot` integer DEFAULT false NOT NULL,
	`nsfw` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `attachments_messageId_idx` ON `attachments` (`message_id`);--> statement-breakpoint
CREATE INDEX `attachments_channelId_idx` ON `attachments` (`channel_id`);--> statement-breakpoint
CREATE INDEX `attachments_guildId_idx` ON `attachments` (`guild_id`);--> statement-breakpoint
CREATE INDEX `attachments_ext_idx` ON `attachments` (`ext`);--> statement-breakpoint
CREATE INDEX `attachments_bot_idx` ON `attachments` (`bot`);--> statement-breakpoint
CREATE INDEX `attachments_nsfw_idx` ON `attachments` (`nsfw`);--> statement-breakpoint
CREATE INDEX `attachments_ext_bot_nsfw_idx` ON `attachments` (`ext`,`bot`,`nsfw`);--> statement-breakpoint
CREATE TABLE `audio_filters` (
	`name` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `boss_files` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
CREATE TABLE `channels` (
	`id` text PRIMARY KEY NOT NULL,
	`guild_id` text NOT NULL,
	`nsfw` integer DEFAULT false NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `channels_guildId_idx` ON `channels` (`guild_id`);--> statement-breakpoint
CREATE INDEX `channels_deleted_idx` ON `channels` (`deleted`);--> statement-breakpoint
CREATE TABLE `chess_games` (
	`user_id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`fen` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chickens` (
	`name` text PRIMARY KEY NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
CREATE TABLE `command_executions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`user_id` text NOT NULL,
	`message_id` text,
	`channel_id` text NOT NULL,
	`guild_id` text
);
--> statement-breakpoint
CREATE INDEX `users_created_at_idx` ON `command_executions` (`created_at`);--> statement-breakpoint
CREATE INDEX `command_executions_name_idx` ON `command_executions` (`name`);--> statement-breakpoint
CREATE INDEX `command_executions_messageId_idx` ON `command_executions` (`message_id`);--> statement-breakpoint
CREATE INDEX `command_executions_channelId_idx` ON `command_executions` (`channel_id`);--> statement-breakpoint
CREATE TABLE `context` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`channel_id` text NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `guilds` (
	`id` text PRIMARY KEY NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `guilds_deleted_idx` ON `guilds` (`deleted`);--> statement-breakpoint
CREATE TABLE `hop_ons` (
	`id` text PRIMARY KEY NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`desc` text NOT NULL,
	`closed_at` integer,
	`reason` text
);
--> statement-breakpoint
CREATE INDEX `issues_userId_idx` ON `issues` (`user_id`);--> statement-breakpoint
CREATE TABLE `kracc_bacc_videos` (
	`name` text PRIMARY KEY NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`guild_id` text NOT NULL,
	`bot` integer DEFAULT false NOT NULL,
	`removed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `members_guildId_idx` ON `members` (`guild_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer,
	`edited_timestamp` integer,
	`author_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`guild_id` text,
	`content` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `messages_authorId_idx` ON `messages` (`author_id`);--> statement-breakpoint
CREATE INDEX `messages_channelId_idx` ON `messages` (`channel_id`);--> statement-breakpoint
CREATE INDEX `messages_guildId_idx` ON `messages` (`guild_id`);--> statement-breakpoint
CREATE TABLE `one_word_story` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`guild_id` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `one_word_story_entry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`user_id` text NOT NULL,
	`story` integer NOT NULL,
	`word` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `random_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`words` text NOT NULL,
	`responses` text NOT NULL,
	`chance` real DEFAULT 1 NOT NULL,
	`cooldown` integer DEFAULT 0 NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
CREATE TABLE `ratios` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`content` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ratios_content_unique` ON `ratios` (`content`);--> statement-breakpoint
CREATE TABLE `rotating_food` (
	`name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `speech_bubbles` (
	`name` text PRIMARY KEY NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
CREATE TABLE `stack_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `themes` (
	`name` text PRIMARY KEY NOT NULL,
	`words` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`counts` text,
	`credit_at` integer,
	`admin` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `y7_files` (
	`name` text PRIMARY KEY NOT NULL,
	`extension` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `youtube_searches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guild_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`message_id` text NOT NULL,
	`ids` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `youtube_searches_guildId_channelId_messageId_idx` ON `youtube_searches` (`guild_id`,`channel_id`,`message_id`);