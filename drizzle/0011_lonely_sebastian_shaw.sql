PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assigned_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quantity` integer NOT NULL,
	`bill_item_id` integer,
	`bill_payer_id` integer,
	FOREIGN KEY (`bill_item_id`) REFERENCES `bill_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bill_payer_id`) REFERENCES `bill_payers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_assigned_items`("id", "quantity", "bill_item_id", "bill_payer_id") SELECT "id", "quantity", "bill_item_id", "bill_payer_id" FROM `assigned_items`;--> statement-breakpoint
DROP TABLE `assigned_items`;--> statement-breakpoint
ALTER TABLE `__new_assigned_items` RENAME TO `assigned_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_bill_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`category` text,
	`bill_id` integer,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_bill_items`("id", "name", "price", "quantity", "category", "bill_id") SELECT "id", "name", "price", "quantity", "category", "bill_id" FROM `bill_items`;--> statement-breakpoint
DROP TABLE `bill_items`;--> statement-breakpoint
ALTER TABLE `__new_bill_items` RENAME TO `bill_items`;--> statement-breakpoint
CREATE TABLE `__new_bill_payers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bill_id` integer,
	`payer_id` integer,
	`party_size` integer NOT NULL,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bill_payers`("id", "bill_id", "payer_id", "party_size") SELECT "id", "bill_id", "payer_id", "party_size" FROM `bill_payers`;--> statement-breakpoint
DROP TABLE `bill_payers`;--> statement-breakpoint
ALTER TABLE `__new_bill_payers` RENAME TO `bill_payers`;--> statement-breakpoint
CREATE UNIQUE INDEX `bill_payer_unique` ON `bill_payers` (`bill_id`,`payer_id`);--> statement-breakpoint
CREATE TABLE `__new_group_payers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer,
	`payer_id` integer,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_group_payers`("id", "group_id", "payer_id") SELECT "id", "group_id", "payer_id" FROM `group_payers`;--> statement-breakpoint
DROP TABLE `group_payers`;--> statement-breakpoint
ALTER TABLE `__new_group_payers` RENAME TO `group_payers`;--> statement-breakpoint
CREATE UNIQUE INDEX `group_payer_unique` ON `group_payers` (`group_id`,`payer_id`);--> statement-breakpoint
CREATE TABLE `__new_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_archived` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_groups`("id", "name", "description", "is_archived") SELECT "id", "name", "description", "is_archived" FROM `groups`;--> statement-breakpoint
DROP TABLE `groups`;--> statement-breakpoint
ALTER TABLE `__new_groups` RENAME TO `groups`;--> statement-breakpoint
ALTER TABLE `payers` ADD `is_archived` integer DEFAULT false NOT NULL;