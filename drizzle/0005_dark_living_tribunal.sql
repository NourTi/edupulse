CREATE TABLE `userAuthAccounts` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(32) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`providerEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userAuthAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_auth_accounts_provider_account_idx` UNIQUE(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE INDEX `user_auth_accounts_user_idx` ON `userAuthAccounts` (`userId`);