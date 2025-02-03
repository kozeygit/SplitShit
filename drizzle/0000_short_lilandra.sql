CREATE TABLE `assigned_items` (
	`id` text PRIMARY KEY NOT NULL,
	`bill_item_id` text,
	`payer_id` text,
	FOREIGN KEY (`bill_item_id`) REFERENCES `bill_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bill_items` (
	`id` text PRIMARY KEY NOT NULL,
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
CREATE TABLE `bill_payers` (
	`id` text PRIMARY KEY NOT NULL,
	`bill_id` text,
	`payer_id` text,
	`party_size` integer NOT NULL,
	`amount_to_pay` real NOT NULL,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bills` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`user_entered_total` real NOT NULL,
	`sub_total` real NOT NULL,
	`final_total` real NOT NULL,
	`service_charge` real DEFAULT 0,
	`complete` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `discounts` (
	`id` text PRIMARY KEY NOT NULL,
	`use_percentage` integer NOT NULL,
	`percentage` real,
	`amount` real
);
--> statement-breakpoint
CREATE TABLE `payers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
