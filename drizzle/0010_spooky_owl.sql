CREATE TABLE `learningAssessments` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`subject` varchar(120) NOT NULL,
	`score` int NOT NULL,
	`assessmentType` varchar(80) NOT NULL DEFAULT 'classwork',
	`assessedAt` timestamp NOT NULL,
	`note` text,
	`recordedById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learningAssessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supportEvaluations` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`stage` varchar(80) NOT NULL,
	`supportLevel` enum('progressing','needs_support','urgent_review') NOT NULL,
	`evidenceJson` text NOT NULL,
	`factorsJson` text NOT NULL,
	`recommendationsJson` text NOT NULL,
	`aiSummary` text,
	`status` enum('draft','reviewed','shared') NOT NULL DEFAULT 'draft',
	`reviewedById` int,
	`reviewedAt` timestamp,
	`followUpAt` timestamp,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supportEvaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `learning_assessments_institution_idx` ON `learningAssessments` (`institutionId`);--> statement-breakpoint
CREATE INDEX `learning_assessments_learner_subject_idx` ON `learningAssessments` (`learnerId`,`subject`);--> statement-breakpoint
CREATE INDEX `learning_assessments_date_idx` ON `learningAssessments` (`institutionId`,`assessedAt`);--> statement-breakpoint
CREATE INDEX `support_evaluations_institution_idx` ON `supportEvaluations` (`institutionId`);--> statement-breakpoint
CREATE INDEX `support_evaluations_learner_idx` ON `supportEvaluations` (`learnerId`);--> statement-breakpoint
CREATE INDEX `support_evaluations_status_idx` ON `supportEvaluations` (`institutionId`,`status`);