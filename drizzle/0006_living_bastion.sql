DROP TABLE `bill_discounts`;--> statement-breakpoint
DROP TABLE `bill_item_discounts`;--> statement-breakpoint
DROP TABLE `discounts`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`user_entered_total` real NOT NULL,
	`service_charge` real DEFAULT 0 NOT NULL,
	`complete` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_bills`("id", "name", "date", "user_entered_total", "service_charge", "complete") SELECT "id", "name", "date", "user_entered_total", "service_charge", "complete" FROM `bills`;--> statement-breakpoint
DROP TABLE `bills`;--> statement-breakpoint
ALTER TABLE `__new_bills` RENAME TO `bills`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_payers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`number` text,
	`email` text
);
--> statement-breakpoint
INSERT INTO `__new_payers`("id", "name", "number", "email") SELECT "id", "name", "number", "email" FROM `payers`;--> statement-breakpoint
DROP TABLE `payers`;--> statement-breakpoint
ALTER TABLE `__new_payers` RENAME TO `payers`;--> statement-breakpoint
ALTER TABLE `bill_items` DROP COLUMN `is_discounted`;--> statement-breakpoint
ALTER TABLE `bill_items` DROP COLUMN `discounted_price`;