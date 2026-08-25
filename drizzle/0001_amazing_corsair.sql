CREATE TABLE `schoolSettings` (
	`id` int NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT 'EduPulse',
	`logoKey` varchar(512),
	`logoUrl` text,
	`updatedById` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schoolSettings_id` PRIMARY KEY(`id`)
);
