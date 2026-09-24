CREATE TABLE `feedback_ideas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`votes` integer DEFAULT 0 NOT NULL,
	`submitter_email` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `return_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`order_item_id` integer,
	`reason` text NOT NULL,
	`resolution` text DEFAULT 'refund' NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`customer_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `postcode` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivery_slot` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `delivery_method` text;