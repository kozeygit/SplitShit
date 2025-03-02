PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assigned_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bill_item_id` integer,
	`bill_payer_id` integer,
	FOREIGN KEY (`bill_item_id`) REFERENCES `bill_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bill_payer_id`) REFERENCES `bill_payers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_assigned_items`("id", "bill_item_id", "bill_payer_id") SELECT "id", "bill_item_id", "bill_payer_id" FROM `assigned_items`;--> statement-breakpoint
DROP TABLE `assigned_items`;--> statement-breakpoint
ALTER TABLE `__new_assigned_items` RENAME TO `assigned_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;