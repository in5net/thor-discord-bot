CREATE TABLE `file_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_id` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`ext` text NOT NULL,
	`nsfw` integer DEFAULT false NOT NULL,
	`sent_at` integer
);
