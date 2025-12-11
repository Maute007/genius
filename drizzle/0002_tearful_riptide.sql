ALTER TABLE `profiles` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `profiles` ADD `whatsapp` varchar(20);--> statement-breakpoint
ALTER TABLE `profiles` ADD `otherInterests` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `learningPreferences` json;--> statement-breakpoint
ALTER TABLE `profiles` ADD `challenges` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `studyGoals` text;--> statement-breakpoint
ALTER TABLE `profiles` DROP COLUMN `classSection`;