-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `albums` (
	`id` varchar(191) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`name` varchar(100) NOT NULL,
	`data` json NOT NULL,
	CONSTRAINT `albums_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `albums_to_playlists` (
	`playlist_id` varchar(191) NOT NULL,
	`album_id` varchar(191) NOT NULL,
	CONSTRAINT `albums_to_playlists_album_id_playlist_id` PRIMARY KEY(`album_id`,`playlist_id`)
);
--> statement-breakpoint
CREATE TABLE `audio_filters` (
	`name` varchar(100) NOT NULL,
	`value` varchar(191) NOT NULL,
	CONSTRAINT `audio_filters_name` PRIMARY KEY(`name`)
);
--> statement-breakpoint
CREATE TABLE `boss_files` (
	`id` varchar(191) NOT NULL,
	`url` text NOT NULL,
	`sent_at` timestamp,
	CONSTRAINT `boss_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chickens` (
	`name` varchar(100) NOT NULL,
	`sent_at` timestamp,
	CONSTRAINT `chickens_name` PRIMARY KEY(`name`)
);
--> statement-breakpoint
CREATE TABLE `command_executions` (
	`id` varchar(191) NOT NULL,
	`created_at` timestamp NOT NULL,
	`name` varchar(191) NOT NULL,
	`type` enum('text','slash','message') NOT NULL,
	`user_id` bigint NOT NULL,
	`message_id` bigint,
	`channel_id` bigint NOT NULL,
	`guild_id` bigint,
	CONSTRAINT `command_executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` bigint NOT NULL,
	`created_at` timestamp NOT NULL,
	`base` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`ext` varchar(191) NOT NULL,
	`author_id` bigint NOT NULL,
	`message_id` bigint NOT NULL,
	`channel_id` bigint NOT NULL,
	`guild_id` bigint NOT NULL,
	`proxy_url` text NOT NULL,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hop_ons` (
	`id` varchar(191) NOT NULL,
	`sent_at` timestamp,
	CONSTRAINT `hop_ons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`user_id` char(18) NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('bug','feature','enhancement') NOT NULL,
	`desc` text NOT NULL,
	`closed_at` timestamp,
	`reason` enum('completed','wont_fix','duplicate','invalid'),
	CONSTRAINT `issues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kracc_bacc_videos` (
	`name` varchar(191) NOT NULL,
	`sent_at` timestamp,
	CONSTRAINT `kracc_bacc_videos_name` PRIMARY KEY(`name`)
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` varchar(191) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`user_id` char(18) NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratios` (
	`id` varchar(191) NOT NULL,
	`created_at` timestamp NOT NULL,
	`content` varchar(191) NOT NULL,
	CONSTRAINT `ratios_id` PRIMARY KEY(`id`),
	CONSTRAINT `ratios_content_key` UNIQUE(`content`)
);
--> statement-breakpoint
CREATE TABLE `rotating_food` (
	`name` varchar(100) NOT NULL,
	CONSTRAINT `rotating_food_name` PRIMARY KEY(`name`)
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` varchar(191) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`playlist_id` varchar(191),
	`album_id` varchar(191),
	`title` text NOT NULL,
	`duration` int NOT NULL,
	`data` json NOT NULL,
	`playlist_index` int,
	`album_index` int,
	CONSTRAINT `songs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `speech_bubbles` (
	`name` varchar(100) NOT NULL,
	`sent_at` timestamp,
	CONSTRAINT `speech_bubbles_name` PRIMARY KEY(`name`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(18) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`counts` json,
	`credit_at` timestamp,
	`admin` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `y7_files` (
	`name` varchar(100) NOT NULL,
	`extension` varchar(4) NOT NULL,
	CONSTRAINT `y7_files_name` PRIMARY KEY(`name`)
);

*/