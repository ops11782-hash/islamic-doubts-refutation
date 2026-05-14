CREATE TABLE `ai_task_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskType` varchar(100) NOT NULL,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`result` text,
	`errorMessage` text,
	`doubtId` int,
	`executedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_task_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameEn` varchar(100),
	`description` text,
	`icon` varchar(100),
	`color` varchar(20) DEFAULT '#1e40af',
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `doubts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`categoryId` int NOT NULL,
	`refutation` text NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`views` int DEFAULT 0,
	`isAIGenerated` int DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doubts_id` PRIMARY KEY(`id`),
	CONSTRAINT `doubts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `hadith_evidences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doubtId` int NOT NULL,
	`text` text NOT NULL,
	`source` varchar(255) NOT NULL,
	`grading` varchar(100),
	`explanation` text,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hadith_evidences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quranic_evidences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doubtId` int NOT NULL,
	`surah` varchar(100) NOT NULL,
	`ayahStart` int NOT NULL,
	`ayahEnd` int,
	`text` text NOT NULL,
	`explanation` text,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quranic_evidences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reality_refutations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doubtId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`evidence` text,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reality_refutations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scholar_statements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doubtId` int NOT NULL,
	`scholarName` varchar(255) NOT NULL,
	`statement` text NOT NULL,
	`source` varchar(255),
	`era` varchar(100),
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scholar_statements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`totalDoubts` int DEFAULT 0,
	`totalViews` int DEFAULT 0,
	`totalVisitors` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `statistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `ai_task_logs` ADD CONSTRAINT `ai_task_logs_doubtId_doubts_id_fk` FOREIGN KEY (`doubtId`) REFERENCES `doubts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `doubts` ADD CONSTRAINT `doubts_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `doubts` ADD CONSTRAINT `doubts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hadith_evidences` ADD CONSTRAINT `hadith_evidences_doubtId_doubts_id_fk` FOREIGN KEY (`doubtId`) REFERENCES `doubts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quranic_evidences` ADD CONSTRAINT `quranic_evidences_doubtId_doubts_id_fk` FOREIGN KEY (`doubtId`) REFERENCES `doubts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reality_refutations` ADD CONSTRAINT `reality_refutations_doubtId_doubts_id_fk` FOREIGN KEY (`doubtId`) REFERENCES `doubts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scholar_statements` ADD CONSTRAINT `scholar_statements_doubtId_doubts_id_fk` FOREIGN KEY (`doubtId`) REFERENCES `doubts`(`id`) ON DELETE cascade ON UPDATE no action;