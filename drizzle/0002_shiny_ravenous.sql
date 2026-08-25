CREATE TABLE `auditLogs` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64),
	`actorUserId` int,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(120) NOT NULL,
	`entityId` varchar(128),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `authSessions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	`userAgent` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `authSessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `institutions` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`locale` varchar(16) NOT NULL DEFAULT 'ar-DZ',
	`timezone` varchar(80) NOT NULL DEFAULT 'Africa/Algiers',
	`retentionDays` int NOT NULL DEFAULT 730,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `institutions_id` PRIMARY KEY(`id`),
	CONSTRAINT `institutions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('owner','admin','registrar','finance_admin','teacher','counsellor','student','guardian') NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`invitedById` int NOT NULL,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','registrar','finance_admin','teacher','counsellor','student','guardian') NOT NULL,
	`status` enum('invited','active','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passwordResetTokens` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passwordResetTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `passwordResetTokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(64) DEFAULT 'password';--> statement-breakpoint
ALTER TABLE `knowledgeSources` ADD `institutionId` varchar(64);--> statement-breakpoint
ALTER TABLE `schoolSettings` ADD `institutionId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('active','invited','suspended') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `mustChangePassword` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordChangedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `audit_logs_institution_idx` ON `auditLogs` (`institutionId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `auth_sessions_user_idx` ON `authSessions` (`userId`);--> statement-breakpoint
CREATE INDEX `invitations_institution_idx` ON `invitations` (`institutionId`);--> statement-breakpoint
CREATE INDEX `memberships_institution_user_idx` ON `memberships` (`institutionId`,`userId`);--> statement-breakpoint
CREATE INDEX `memberships_user_idx` ON `memberships` (`userId`);--> statement-breakpoint
CREATE INDEX `password_reset_user_idx` ON `passwordResetTokens` (`userId`);--> statement-breakpoint
CREATE INDEX `knowledge_chunks_source_idx` ON `knowledgeChunks` (`sourceId`);--> statement-breakpoint
CREATE INDEX `knowledge_sources_institution_idx` ON `knowledgeSources` (`institutionId`);