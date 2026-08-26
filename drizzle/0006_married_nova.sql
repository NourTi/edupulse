CREATE TABLE `educatorTasks` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64),
	`title` varchar(255) NOT NULL,
	`category` enum('follow_up','essay','behavior','mentorship','report') NOT NULL DEFAULT 'follow_up',
	`dueAt` timestamp,
	`completedAt` timestamp,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `educatorTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `educator_tasks_institution_idx` ON `educatorTasks` (`institutionId`);--> statement-breakpoint
CREATE INDEX `educator_tasks_learner_idx` ON `educatorTasks` (`learnerId`);