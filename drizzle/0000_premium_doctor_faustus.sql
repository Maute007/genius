CREATE TYPE "public"."conversation_mode" AS ENUM('quick_doubt', 'exam_prep', 'revision', 'free_learning');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('mpesa', 'emola', 'mkesh', 'manual');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'student', 'student_plus', 'family');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."school_lead_status" AS ENUM('not_contacted', 'contacted', 'interested', 'negotiating', 'partner', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."school_type" AS ENUM('self_learner', 'non_student', 'public_school', 'private_school', 'public_university', 'private_university', 'technical_institute', 'other');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"type" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"profile_id" integer NOT NULL,
	"title" varchar(255),
	"mode" "conversation_mode" NOT NULL,
	"subject" varchar(100),
	"topic" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_user_id" integer NOT NULL,
	"student_profile_id" integer NOT NULL,
	"relationship" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"subject" varchar(100) NOT NULL,
	"topic" varchar(255) NOT NULL,
	"mastery_level" integer DEFAULT 0 NOT NULL,
	"practice_count" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"total_answers" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp,
	"next_review_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"tokens" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_user_id" integer NOT NULL,
	"student_profile_id" integer NOT NULL,
	"week_start" timestamp NOT NULL,
	"week_end" timestamp NOT NULL,
	"total_study_time" integer DEFAULT 0 NOT NULL,
	"questions_asked" integer DEFAULT 0 NOT NULL,
	"exercises_completed" integer DEFAULT 0 NOT NULL,
	"average_accuracy" integer DEFAULT 0 NOT NULL,
	"report_data" json,
	"email_sent" boolean DEFAULT false NOT NULL,
	"email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(320),
	"whatsapp" varchar(20),
	"age" integer NOT NULL,
	"grade" varchar(50) NOT NULL,
	"interests" json NOT NULL,
	"other_interests" text,
	"learning_style" text,
	"learning_preferences" json,
	"challenges" text,
	"study_goals" text,
	"school_name" varchar(255) NOT NULL,
	"school_type" "school_type" NOT NULL,
	"province" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"contact_person" varchar(255),
	"contact_email" varchar(320),
	"contact_phone" varchar(50),
	"status" "school_lead_status" DEFAULT 'not_contacted' NOT NULL,
	"notes" text,
	"last_contact_date" timestamp,
	"potential_revenue" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"normalized_name" varchar(255) NOT NULL,
	"type" "school_type" NOT NULL,
	"province" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"total_students" integer DEFAULT 0 NOT NULL,
	"active_students" integer DEFAULT 0 NOT NULL,
	"is_partner" boolean DEFAULT false NOT NULL,
	"partner_since" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'MZN' NOT NULL,
	"plan" varchar(50) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_reference" varchar(255),
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"open_id" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"password" varchar(255),
	"email_verified" boolean DEFAULT false NOT NULL,
	"verification_token" varchar(255),
	"login_method" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"subscription_status" "subscription_status" DEFAULT 'active' NOT NULL,
	"subscription_expires_at" timestamp,
	"monthly_questions_used" integer DEFAULT 0 NOT NULL,
	"last_question_reset_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_open_id_unique" UNIQUE("open_id")
);
