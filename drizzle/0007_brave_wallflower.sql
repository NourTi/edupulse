CREATE TABLE `educatorRecords` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64),
	`category` enum('essay','behavior','mentorship','resource','language_evolution','client') NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`stage` varchar(80),
	`score` int,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `educatorRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `educator_records_institution_idx` ON `educatorRecords` (`institutionId`);--> statement-breakpoint
CREATE INDEX `educator_records_learner_idx` ON `educatorRecords` (`learnerId`);--> statement-breakpoint
CREATE INDEX `educator_records_category_idx` ON `educatorRecords` (`institutionId`,`category`);