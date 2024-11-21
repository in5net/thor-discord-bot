PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_image_searches` (
	`message_id` text PRIMARY KEY NOT NULL,
	`query` text NOT NULL,
	`index` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_image_searches`("message_id", "query", "index") SELECT "message_id", "query", "index" FROM `image_searches`;--> statement-breakpoint
DROP TABLE `image_searches`;--> statement-breakpoint
ALTER TABLE `__new_image_searches` RENAME TO `image_searches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;