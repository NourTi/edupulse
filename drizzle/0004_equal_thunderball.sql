CREATE TABLE `learnerUsers` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`studentUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learnerUsers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `learner_users_institution_idx` ON `learnerUsers` (`institutionId`);--> statement-breakpoint
CREATE INDEX `learner_users_learner_idx` ON `learnerUsers` (`learnerId`);--> statement-breakpoint
CREATE INDEX `learner_users_student_idx` ON `learnerUsers` (`studentUserId`);