PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_queues` (
	`guild_id` text PRIMARY KEY NOT NULL,
	`voice_channel_id` text NOT NULL,
	`text_channel_id` text,
	`songs` text NOT NULL,
	`index` integer NOT NULL,
	`seek` integer NOT NULL,
	`loop` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_queues`("guild_id", "voice_channel_id", "text_channel_id", "songs", "index", "seek", "loop") SELECT "guild_id", "voice_channel_id", "text_channel_id", "songs", "index", "seek", "loop" FROM `queues`;--> statement-breakpoint
DROP TABLE `queues`;--> statement-breakpoint
ALTER TABLE `__new_queues` RENAME TO `queues`;--> statement-breakpoint
PRAGMA foreign_keys=ON;