CREATE TABLE `bill_discounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bill_id` text,
	`discount_id` text,
	FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`discount_id`) REFERENCES `discounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bill_item_discounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bill_item_id` text,
	`discount_id` text,
	FOREIGN KEY (`bill_item_id`) REFERENCES `bill_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`discount_id`) REFERENCES `discounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `bill_items` DROP COLUMN `total_price`;--> statement-breakpoint
ALTER TABLE `bill_items` DROP COLUMN `assigned_to`;--> statement-breakpoint
ALTER TABLE `bill_payers` DROP COLUMN `amount_to_pay`;--> statement-breakpoint
ALTER TABLE `bills` DROP COLUMN `sub_total`;--> statement-breakpoint
ALTER TABLE `bills` DROP COLUMN `final_total`;