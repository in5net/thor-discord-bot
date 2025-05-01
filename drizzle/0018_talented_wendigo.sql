PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_members` (
	`id` text NOT NULL,
	`guild_id` text NOT NULL,
	`bot` integer DEFAULT false NOT NULL,
	`last_joined_vc_at` integer,
	`last_joined_vc_id` text,
	`removed` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`id`, `guild_id`),
	FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_members`("id", "guild_id", "bot", "last_joined_vc_at", "last_joined_vc_id", "removed") SELECT "id", "guild_id", "bot", "last_joined_vc_at", "last_joined_vc_id", "removed" FROM `members`;--> statement-breakpoint
DROP TABLE `members`;--> statement-breakpoint
ALTER TABLE `__new_members` RENAME TO `members`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `members_guildId_idx` ON `members` (`guild_id`);