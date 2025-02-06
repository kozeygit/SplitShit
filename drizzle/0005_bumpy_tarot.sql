PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assigned_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bill_item_id` integer,
	`payer_id` integer,
	FOREIGN KEY (`bill_item_id`) REFERENCES `bill_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_assigned_items`("id", "bill_item_id", "payer_id") SELECT "id", "bill_item_id", "payer_id" FROM `assigned_items`;--> statement-breakpoint
DROP TABLE `assigned_items`;--> statement-breakpoint
ALTER TABLE `__new_assigned_items` RENAME TO `assigned_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_bill_discounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bill_id` integer,
	`discount_id` integer,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`discount_id`) REFERENCES `discounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bill_discounts`("id", "bill_id", "discount_id") SELECT "id", "bill_id", "discount_id" FROM `bill_discounts`;--> statement-breakpoint
DROP TABLE `bill_discounts`;--> statement-breakpoint
ALTER TABLE `__new_bill_discounts` RENAME TO `bill_discounts`;--> statement-breakpoint
CREATE TABLE `__new_bill_item_discounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bill_item_id` integer,
	`discount_id` integer,
	FOREIGN KEY (`bill_item_id`) REFERENCES `bill_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`discount_id`) REFERENCES `discounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bill_item_discounts`("id", "bill_item_id", "discount_id") SELECT "id", "bill_item_id", "discount_id" FROM `bill_item_discounts`;--> statement-breakpoint
DROP TABLE `bill_item_discounts`;--> statement-breakpoint
ALTER TABLE `__new_bill_item_discounts` RENAME TO `bill_item_discounts`;--> statement-breakpoint
CREATE TABLE `__new_bill_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`quantity` integer NOT NULL,
	`is_discounted` integer DEFAULT 0,
	`discounted_price` real,
	`category` text,
	`bill_id` integer,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bill_items`("id", "name", "price", "quantity", "is_discounted", "discounted_price", "category", "bill_id") SELECT "id", "name", "price", "quantity", "is_discounted", "discounted_price", "category", "bill_id" FROM `bill_items`;--> statement-breakpoint
DROP TABLE `bill_items`;--> statement-breakpoint
ALTER TABLE `__new_bill_items` RENAME TO `bill_items`;--> statement-breakpoint
CREATE TABLE `__new_bill_payers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bill_id` integer,
	`payer_id` integer,
	`party_size` integer NOT NULL,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bill_payers`("id", "bill_id", "payer_id", "party_size") SELECT "id", "bill_id", "payer_id", "party_size" FROM `bill_payers`;--> statement-breakpoint
DROP TABLE `bill_payers`;--> statement-breakpoint
ALTER TABLE `__new_bill_payers` RENAME TO `bill_payers`;