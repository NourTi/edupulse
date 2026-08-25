CREATE TABLE `attendanceRecords` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`date` timestamp NOT NULL,
	`status` enum('present','late','excused','absent') NOT NULL,
	`note` text,
	`recordedById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendanceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cefrAssessments` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`level` varchar(8) NOT NULL,
	`speaking` int NOT NULL,
	`listening` int NOT NULL,
	`reading` int NOT NULL,
	`writing` int NOT NULL,
	`note` text,
	`status` enum('draft','approved') NOT NULL DEFAULT 'draft',
	`assessedById` int NOT NULL,
	`assessedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cefrAssessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learnerGuardians` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`guardianUserId` int NOT NULL,
	`relationship` varchar(80) NOT NULL DEFAULT 'guardian',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learnerGuardians_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learners` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`name` varchar(160) NOT NULL,
	`nameAr` varchar(160) NOT NULL,
	`grade` varchar(80) NOT NULL,
	`phone` varchar(40),
	`status` enum('active','new','review','archived') NOT NULL DEFAULT 'active',
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentRecords` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`amountMinor` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'DZD',
	`method` varchar(60) NOT NULL,
	`status` enum('paid','balance_due','void') NOT NULL DEFAULT 'paid',
	`paidAt` timestamp NOT NULL,
	`recordedById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paymentRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `attendance_institution_date_idx` ON `attendanceRecords` (`institutionId`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_learner_idx` ON `attendanceRecords` (`learnerId`);--> statement-breakpoint
CREATE INDEX `cefr_institution_idx` ON `cefrAssessments` (`institutionId`);--> statement-breakpoint
CREATE INDEX `cefr_learner_idx` ON `cefrAssessments` (`learnerId`);--> statement-breakpoint
CREATE INDEX `learner_guardians_institution_idx` ON `learnerGuardians` (`institutionId`);--> statement-breakpoint
CREATE INDEX `learner_guardians_learner_idx` ON `learnerGuardians` (`learnerId`);--> statement-breakpoint
CREATE INDEX `learner_guardians_guardian_idx` ON `learnerGuardians` (`guardianUserId`);--> statement-breakpoint
CREATE INDEX `learners_institution_idx` ON `learners` (`institutionId`);--> statement-breakpoint
CREATE INDEX `payments_institution_idx` ON `paymentRecords` (`institutionId`);--> statement-breakpoint
CREATE INDEX `payments_learner_idx` ON `paymentRecords` (`learnerId`);