ALTER TABLE `groups` ADD `image_path` text;--> statement-breakpoint
ALTER TABLE `payers` ADD `image_path` text;--> statement-breakpoint
ALTER TABLE `bill_payers` DROP COLUMN `party_size`;