CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileId` int NOT NULL,
	`title` varchar(255),
	`mode` enum('quick_doubt','exam_prep','revision','free_learning') NOT NULL,
	`subject` varchar(100),
	`topic` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `familyMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentUserId` int NOT NULL,
	`studentProfileId` int NOT NULL,
	`relationship` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `familyMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learningProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`topic` varchar(255) NOT NULL,
	`masteryLevel` int NOT NULL DEFAULT 0,
	`practiceCount` int NOT NULL DEFAULT 0,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`totalAnswers` int NOT NULL DEFAULT 0,
	`lastReviewedAt` timestamp,
	`nextReviewAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learningProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`tokens` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parentReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentUserId` int NOT NULL,
	`studentProfileId` int NOT NULL,
	`weekStart` timestamp NOT NULL,
	`weekEnd` timestamp NOT NULL,
	`totalStudyTime` int NOT NULL DEFAULT 0,
	`questionsAsked` int NOT NULL DEFAULT 0,
	`exercisesCompleted` int NOT NULL DEFAULT 0,
	`averageAccuracy` int NOT NULL DEFAULT 0,
	`reportData` json,
	`emailSent` boolean NOT NULL DEFAULT false,
	`emailSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parentReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`age` int NOT NULL,
	`grade` varchar(50) NOT NULL,
	`interests` json NOT NULL,
	`learningStyle` text,
	`schoolName` varchar(255) NOT NULL,
	`schoolType` enum('public_school','private_school','public_university','private_university','technical_institute','other') NOT NULL,
	`province` varchar(100) NOT NULL,
	`city` varchar(100) NOT NULL,
	`classSection` varchar(50),
	`onboardingCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schoolLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`contactPerson` varchar(255),
	`contactEmail` varchar(320),
	`contactPhone` varchar(50),
	`status` enum('not_contacted','contacted','interested','negotiating','partner','rejected') NOT NULL DEFAULT 'not_contacted',
	`notes` text,
	`lastContactDate` timestamp,
	`potentialRevenue` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schoolLeads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`normalizedName` varchar(255) NOT NULL,
	`type` enum('public_school','private_school','public_university','private_university','technical_institute','other') NOT NULL,
	`province` varchar(100) NOT NULL,
	`city` varchar(100) NOT NULL,
	`totalStudents` int NOT NULL DEFAULT 0,
	`activeStudents` int NOT NULL DEFAULT 0,
	`isPartner` boolean NOT NULL DEFAULT false,
	`partnerSince` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'MZN',
	`plan` varchar(50) NOT NULL,
	`paymentMethod` enum('mpesa','emola','mkesh','manual') NOT NULL,
	`paymentReference` varchar(255),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('free','student','student_plus','family') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','expired','cancelled') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `monthlyQuestionsUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastQuestionResetAt` timestamp DEFAULT (now()) NOT NULL;