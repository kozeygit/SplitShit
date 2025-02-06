PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assigned_items` (
	`id` integer PRIMARY KEY NOT NULL,
	`bill_item_id` text,
	`payer_id` text,
	FOREIGN KEY (`bill_item_id`) REFERENCES `bill_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_assigned_items`("id", "bill_item_id", "payer_id") SELECT "id", "bill_item_id", "payer_id" FROM `assigned_items`;--> statement-breakpoint
DROP TABLE `assigned_items`;--> statement-breakpoint
ALTER TABLE `__new_assigned_items` RENAME TO `assigned_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_bill_items` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`quantity` integer NOT NULL,
	`total_price` real NOT NULL,
	`assigned_to` text NOT NULL,
	`is_discounted` integer DEFAULT 0,
	`discounted_price` real,
	`category` text,
	`bill_id` text,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bill_items`("id", "name", "price", "quantity", "total_price", "assigned_to", "is_discounted", "discounted_price", "category", "bill_id") SELECT "id", "name", "price", "quantity", "total_price", "assigned_to", "is_discounted", "discounted_price", "category", "bill_id" FROM `bill_items`;--> statement-breakpoint
DROP TABLE `bill_items`;--> statement-breakpoint
ALTER TABLE `__new_bill_items` RENAME TO `bill_items`;--> statement-breakpoint
CREATE TABLE `__new_bill_payers` (
	`id` integer PRIMARY KEY NOT NULL,
	`bill_id` text,
	`payer_id` text,
	`party_size` integer NOT NULL,
	`amount_to_pay` real NOT NULL,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bill_payers`("id", "bill_id", "payer_id", "party_size", "amount_to_pay") SELECT "id", "bill_id", "payer_id", "party_size", "amount_to_pay" FROM `bill_payers`;--> statement-breakpoint
DROP TABLE `bill_payers`;--> statement-breakpoint
ALTER TABLE `__new_bill_payers` RENAME TO `bill_payers`;--> statement-breakpoint
CREATE TABLE `__new_bills` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`user_entered_total` real NOT NULL,
	`sub_total` real NOT NULL,
	`final_total` real NOT NULL,
	`service_charge` real DEFAULT 0,
	`complete` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_bills`("id", "name", "date", "user_entered_total", "sub_total", "final_total", "service_charge", "complete") SELECT "id", "name", "date", "user_entered_total", "sub_total", "final_total", "service_charge", "complete" FROM `bills`;--> statement-breakpoint
DROP TABLE `bills`;--> statement-breakpoint
ALTER TABLE `__new_bills` RENAME TO `bills`;--> statement-breakpoint
CREATE TABLE `__new_discounts` (
	`id` integer PRIMARY KEY NOT NULL,
	`use_percentage` integer NOT NULL,
	`percentage` real,
	`amount` real
);
--> statement-breakpoint
INSERT INTO `__new_discounts`("id", "use_percentage", "percentage", "amount") SELECT "id", "use_percentage", "percentage", "amount" FROM `discounts`;--> statement-breakpoint
DROP TABLE `discounts`;--> statement-breakpoint
ALTER TABLE `__new_discounts` RENAME TO `discounts`;--> statement-breakpoint
CREATE TABLE `__new_payers` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`number` integer,
	`email` text
);
--> statement-breakpoint
INSERT INTO `__new_payers`("id", "name", "number", "email") SELECT "id", "name", "number", "email" FROM `payers`;--> statement-breakpoint
DROP TABLE `payers`;--> statement-breakpoint
ALTER TABLE `__new_payers` RENAME TO `payers`;