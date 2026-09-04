CREATE TABLE `enquiries` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`householdId` varchar(64),
	`name` varchar(160) NOT NULL,
	`nameAr` varchar(160),
	`phone` varchar(40),
	`source` varchar(80),
	`targetLang` varchar(8),
	`stage` varchar(80),
	`status` enum('new','test_scheduled','evaluated','trial','offer','enrolled','archived') NOT NULL DEFAULT 'new',
	`score` int,
	`assignedTo` int,
	`note` text,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `households` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`primaryGuardianId` int,
	`name` varchar(160) NOT NULL,
	`address` varchar(255),
	`phone` varchar(40),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `households_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `households_institution_idx` ON `households` (`institutionId`);
--> statement-breakpoint
CREATE TABLE `cohorts` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`nameAr` varchar(160) NOT NULL,
	`nameEn` varchar(160) NOT NULL,
	`stage` varchar(80) NOT NULL,
	`taughtLanguage` varchar(8) NOT NULL DEFAULT 'ar',
	`capacity` int NOT NULL DEFAULT 24,
	`room` varchar(80),
	`scheduleJson` text,
	`knowledgeGraphNodeIds` text,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
	CONSTRAINT `cohorts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `cohorts_institution_idx` ON `cohorts` (`institutionId`);
--> statement-breakpoint
CREATE TABLE `cohortLearners` (
	`id` varchar(64) NOT NULL,
	`cohortId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cohortLearners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `cohort_learners_cohort_idx` ON `cohortLearners` (`cohortId`);
--> statement-breakpoint
CREATE INDEX `cohort_learners_learner_idx` ON `cohortLearners` (`learnerId`);
--> statement-breakpoint
CREATE TABLE `supervisionMilestones` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`dueAt` timestamp,
	`status` enum('pending','submitted','reviewed','approved') NOT NULL DEFAULT 'pending',
	`evidenceUrl` text,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
	CONSTRAINT `supervisionMilestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `supervision_institution_idx` ON `supervisionMilestones` (`institutionId`);
--> statement-breakpoint
CREATE INDEX `supervision_learner_idx` ON `supervisionMilestones` (`learnerId`);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`meetingAt` timestamp NOT NULL,
	`notes` text NOT NULL,
	`actionItemsJson` text,
	`nextAt` timestamp,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `consultations_institution_idx` ON `consultations` (`institutionId`);
--> statement-breakpoint
CREATE INDEX `consultations_learner_idx` ON `consultations` (`learnerId`);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`kind` enum('whatsapp','certificate','report','fiche_cba','fiche_td') NOT NULL,
	`lang` varchar(8) NOT NULL DEFAULT 'ar',
	`title` varchar(160) NOT NULL,
	`bodyAr` text,
	`bodyEn` text,
	`bodyFr` text,
	`variablesJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `templates_institution_idx` ON `templates` (`institutionId`);
--> statement-breakpoint
CREATE TABLE `knowledgeGraphNodes` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64),
	`stage` varchar(80) NOT NULL,
	`stream` varchar(80),
	`subject` varchar(80) NOT NULL,
	`unit` varchar(160) NOT NULL,
	`competencyAr` text NOT NULL,
	`competencyEn` text NOT NULL,
	`competencyCode` varchar(80),
	`kind` enum('competency','skill','knowledge') NOT NULL DEFAULT 'competency',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledgeGraphNodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `kg_stage_subject_idx` ON `knowledgeGraphNodes` (`stage`,`subject`);
--> statement-breakpoint
CREATE TABLE `conceptEdges` (
	`id` varchar(64) NOT NULL,
	`fromNodeId` varchar(64) NOT NULL,
	`toNodeId` varchar(64) NOT NULL,
	`kind` enum('prerequisite','related','confuses_with') NOT NULL DEFAULT 'prerequisite',
	CONSTRAINT `conceptEdges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `concept_edges_from_idx` ON `conceptEdges` (`fromNodeId`);
--> statement-breakpoint
CREATE INDEX `concept_edges_to_idx` ON `conceptEdges` (`toNodeId`);
--> statement-breakpoint
CREATE TABLE `notebooks` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`ownerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`kind` enum('learner','cohort','supervision','research') NOT NULL DEFAULT 'learner',
	`learnerIdsJson` text,
	`chunkIdsJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
	CONSTRAINT `notebooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `notebooks_institution_idx` ON `notebooks` (`institutionId`);
--> statement-breakpoint
CREATE TABLE `plannerProposals` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64),
	`cohortId` varchar(64),
	`titleAr` varchar(255) NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`reasonJson` text,
	`dueAt` timestamp,
	`source` enum('attendance','assessment','cefr','supervision','exam_clone','fsrs') NOT NULL DEFAULT 'assessment',
	`status` enum('proposed','accepted','dismissed','completed') NOT NULL DEFAULT 'proposed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plannerProposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `planner_institution_idx` ON `plannerProposals` (`institutionId`);
--> statement-breakpoint
CREATE TABLE `algerianResources` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64),
	`kind` enum('programme','progression','manuel','fiche_exemplaire','grille_bac','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`stage` varchar(80),
	`stream` varchar(80),
	`unit` varchar(160),
	`storageKey` varchar(512),
	`sourceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `algerianResources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `algerian_res_kind_stage_idx` ON `algerianResources` (`kind`,`stage`);
--> statement-breakpoint
CREATE TABLE `lessonPlans` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`cohortId` varchar(64),
	`nodeId` varchar(64),
	`title` varchar(255) NOT NULL,
	`ficheKind` enum('fiche_cba','fiche_td','fiche_tp') NOT NULL DEFAULT 'fiche_cba',
	`stage` varchar(80) NOT NULL,
	`stream` varchar(80),
	`durationMinutes` int NOT NULL DEFAULT 60,
	`chartSummaryJson` text,
	`ficheJson` text NOT NULL,
	`citationsJson` text,
	`status` enum('draft','approved','archived') NOT NULL DEFAULT 'draft',
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
	CONSTRAINT `lessonPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `lesson_plans_institution_idx` ON `lessonPlans` (`institutionId`);
--> statement-breakpoint
CREATE INDEX `lesson_plans_cohort_idx` ON `lessonPlans` (`cohortId`);
--> statement-breakpoint
CREATE TABLE `examClones` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`sourceExamId` varchar(64),
	`cohortId` varchar(64),
	`title` varchar(255) NOT NULL,
	`style` varchar(80) NOT NULL DEFAULT 'bac',
	`difficulty` varchar(20) NOT NULL DEFAULT 'medium',
	`format` varchar(40) NOT NULL DEFAULT 'bac_written',
	`clonedExamJson` text NOT NULL,
	`citationsJson` text,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `examClones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `exam_clones_institution_idx` ON `examClones` (`institutionId`);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`competencyId` varchar(64),
	`front` text NOT NULL,
	`back` text NOT NULL,
	`frontAr` text,
	`backAr` text,
	`fsrsStateJson` text,
	`dueAt` timestamp,
	`lastReviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flashcards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `flashcards_learner_due_idx` ON `flashcards` (`learnerId`,`dueAt`);
--> statement-breakpoint
CREATE INDEX `flashcards_institution_idx` ON `flashcards` (`institutionId`);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`cohortId` varchar(64),
	`competencyId` varchar(64),
	`title` varchar(255) NOT NULL,
	`itemsJson` text NOT NULL,
	`sourceChunkIds` text,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `quizzes_institution_idx` ON `quizzes` (`institutionId`);
--> statement-breakpoint
CREATE TABLE `teachBacks` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`prompt` text NOT NULL,
	`transcript` text NOT NULL,
	`audioUrl` text,
	`score` int,
	`gapsJson` text,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teachBacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `teachbacks_learner_idx` ON `teachBacks` (`learnerId`);
--> statement-breakpoint
CREATE TABLE `researchReports` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64),
	`query` varchar(512) NOT NULL,
	`sourcesJson` text,
	`reportMd` text NOT NULL,
	`citationsJson` text,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `researchReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `research_reports_institution_idx` ON `researchReports` (`institutionId`);
--> statement-breakpoint
CREATE TABLE `learningPaths` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`kind` enum('remedial','mastery','research','exam') NOT NULL DEFAULT 'mastery',
	`orderedNodeIdsJson` text NOT NULL,
	`progressJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE now(),
	CONSTRAINT `learningPaths_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `learning_paths_learner_idx` ON `learningPaths` (`learnerId`);
--> statement-breakpoint
CREATE TABLE `focusSessions` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`cohortId` varchar(64),
	`block` varchar(80),
	`durationMinutes` int NOT NULL,
	`xpEarned` int NOT NULL DEFAULT 0,
	`startedAt` timestamp NOT NULL,
	`endedAt` timestamp,
	CONSTRAINT `focusSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `focus_sessions_learner_idx` ON `focusSessions` (`learnerId`);
