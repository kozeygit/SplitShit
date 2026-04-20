PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bill_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`category` text,
	`bill_id` integer,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bill_items`("id", "name", "price", "quantity", "category", "bill_id") SELECT "id", "name", "price", "quantity", "category", "bill_id" FROM `bill_items`;--> statement-breakpoint
DROP TABLE `bill_items`;--> statement-breakpoint
ALTER TABLE `__new_bill_items` RENAME TO `bill_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_bills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`user_entered_total` integer NOT NULL,
	`service_charge` integer DEFAULT 0 NOT NULL,
	`complete` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_bills`("id", "name", "date", "user_entered_total", "service_charge", "complete") SELECT "id", "name", "date", "user_entered_total", "service_charge", "complete" FROM `bills`;--> statement-breakpoint
DROP TABLE `bills`;--> statement-breakpoint
ALTER TABLE `__new_bills` RENAME TO `bills`;