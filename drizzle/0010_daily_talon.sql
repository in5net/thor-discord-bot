ALTER TABLE `files` ADD `path` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_file_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_file_tags`("id", "file_id", "name") SELECT "id", "file_id", "name" FROM `file_tags`;--> statement-breakpoint
DROP TABLE `file_tags`;--> statement-breakpoint
ALTER TABLE `__new_file_tags` RENAME TO `file_tags`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `file_tags_name_fileId_idx` ON `file_tags` (`name`,`file_id`);