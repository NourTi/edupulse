CREATE TABLE `commerceInvoices` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`learnerId` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`invoiceNumber` varchar(80) NOT NULL,
	`amountMinor` int NOT NULL,
	`discountMinor` int NOT NULL DEFAULT 0,
	`currency` varchar(8) NOT NULL DEFAULT 'DZD',
	`status` enum('draft','issued','partially_paid','paid','void','refunded') NOT NULL DEFAULT 'issued',
	`dueAt` timestamp,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commerceInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `commerce_invoices_number_idx` UNIQUE(`institutionId`,`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `commerceProducts` (
	`id` varchar(64) NOT NULL,
	`institutionId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`description` text,
	`amountMinor` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'DZD',
	`kind` enum('fee','course','service','subscription') NOT NULL DEFAULT 'fee',
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'active',
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commerceProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `commerce_invoices_institution_idx` ON `commerceInvoices` (`institutionId`);--> statement-breakpoint
CREATE INDEX `commerce_invoices_learner_idx` ON `commerceInvoices` (`learnerId`);--> statement-breakpoint
CREATE INDEX `commerce_invoices_product_idx` ON `commerceInvoices` (`productId`);--> statement-breakpoint
CREATE INDEX `commerce_products_institution_idx` ON `commerceProducts` (`institutionId`);--> statement-breakpoint
CREATE INDEX `commerce_products_status_idx` ON `commerceProducts` (`institutionId`,`status`);