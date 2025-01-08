PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_files` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`name` text NOT NULL,
	`ext` text NOT NULL,
	`nsfw` integer DEFAULT false NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_files`("id", "path", "name", "ext", "nsfw", "sent_at") SELECT "id", "path", "name", "ext", "nsfw", "sent_at" FROM `files`;--> statement-breakpoint
DROP TABLE `files`;--> statement-breakpoint
ALTER TABLE `__new_files` RENAME TO `files`;--> statement-breakpoint
PRAGMA foreign_keys=ON;