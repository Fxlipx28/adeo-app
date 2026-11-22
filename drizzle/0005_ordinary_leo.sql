CREATE TABLE `rideRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`origin` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`originLat` double,
	`originLng` double,
	`destLat` double,
	`destLng` double,
	`countryCode` varchar(2) NOT NULL DEFAULT 'CL',
	`travelDate` varchar(10) NOT NULL,
	`seats` int NOT NULL DEFAULT 1,
	`note` varchar(500),
	`status` enum('open','cancelled') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rideRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `trips` ADD `luggage` enum('light','backpack','large') DEFAULT 'backpack' NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `allowsPets` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `allowsGear` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `meetingPoint` varchar(255);