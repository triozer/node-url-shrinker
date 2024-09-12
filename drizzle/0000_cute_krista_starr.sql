CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`url` text NOT NULL,
	`slug` text NOT NULL,
	`title` text,
	`expiresAt` text
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`linkId` text NOT NULL,
	`city` text,
	`country` text
);
