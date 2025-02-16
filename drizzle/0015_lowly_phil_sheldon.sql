CREATE TABLE `queues` (
	`guild_id` text PRIMARY KEY NOT NULL,
	`voice_channel_id` text NOT NULL,
	`text_channel_id` text NOT NULL,
	`songs` text NOT NULL,
	`index` integer NOT NULL,
	`seek` integer NOT NULL,
	`loop` integer NOT NULL
);
