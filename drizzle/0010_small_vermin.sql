CREATE TABLE `group_payers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer,
	`payer_id` integer,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_payer_unique` ON `group_payers` (`group_id`,`payer_id`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `bills` ADD `group_id` integer REFERENCES groups(id);--> statement-breakpoint
CREATE UNIQUE INDEX `bill_payer_unique` ON `bill_payers` (`bill_id`,`payer_id`);