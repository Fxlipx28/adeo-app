CREATE TABLE `tripShares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tripShares_id` PRIMARY KEY(`id`),
	CONSTRAINT `tripShares_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `trips` ADD `countryCode` varchar(2) DEFAULT 'CL' NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `currency` varchar(3) DEFAULT 'CLP' NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `distanceKm` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `tollsAmount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `countryCode` varchar(2) DEFAULT 'CL' NOT NULL;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `emergencyContactName` varchar(120);--> statement-breakpoint
ALTER TABLE `userProfiles` ADD `emergencyContactPhone` varchar(20);