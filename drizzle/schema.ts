import { integer, bigint, pgEnum, pgTable, text, timestamp, varchar, boolean, json, jsonb, serial } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin", "super_admin"]);
export const planEnum = pgEnum("plan", ["free", "student", "student_plus", "family"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "expired", "cancelled"]);
export const schoolTypeEnum = pgEnum("school_type", ["self_learner", "non_student", "public_school", "private_school", "public_university", "private_university", "technical_institute", "other"]);
export const schoolLeadStatusEnum = pgEnum("school_lead_status", ["not_contacted", "contacted", "interested", "negotiating", "partner", "rejected"]);
export const conversationModeEnum = pgEnum("conversation_mode", ["quick_doubt", "exam_prep", "revision", "free_learning"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);
export const paymentMethodEnum = pgEnum("payment_method", ["mpesa", "emola", "mkesh", "manual"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed", "refunded"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationToken: varchar("verification_token", { length: 255 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  
  plan: planEnum("plan").default("free").notNull(),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("active").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  
  monthlyQuestionsUsed: integer("monthly_questions_used").default(0).notNull(),
  lastQuestionResetAt: timestamp("last_question_reset_at").defaultNow().notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  age: integer("age"),
  grade: varchar("grade", { length: 50 }),
  interests: jsonb("interests").$type<string[]>(),
  otherInterests: text("other_interests"),
  learningStyle: text("learning_style"),
  learningPreferences: jsonb("learning_preferences").$type<string[]>(),
  challenges: text("challenges"),
  studyGoals: text("study_goals"),
  
  schoolName: varchar("school_name", { length: 255 }),
  schoolType: varchar("school_type", { length: 50 }),
  province: varchar("province", { length: 100 }),
  city: varchar("city", { length: 100 }),
  
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  normalizedName: varchar("normalized_name", { length: 255 }).notNull(),
  type: schoolTypeEnum("type").notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  
  totalStudents: integer("total_students").default(0).notNull(),
  activeStudents: integer("active_students").default(0).notNull(),
  
  isPartner: boolean("is_partner").default(false).notNull(),
  partnerSince: timestamp("partner_since"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const schoolLeads = pgTable("school_leads", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  
  contactPerson: varchar("contact_person", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 320 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  
  status: schoolLeadStatusEnum("status").default("not_contacted").notNull(),
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  
  potentialRevenue: integer("potential_revenue").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  profileId: integer("profile_id").notNull(),
  
  title: varchar("title", { length: 255 }),
  mode: conversationModeEnum("mode").notNull(),
  subject: varchar("subject", { length: 100 }),
  topic: varchar("topic", { length: 255 }),
  
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  
  tokens: integer("tokens"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const learningProgress = pgTable("learning_progress", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  
  subject: varchar("subject", { length: 100 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  
  masteryLevel: integer("mastery_level").default(0).notNull(),
  practiceCount: integer("practice_count").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  totalAnswers: integer("total_answers").default(0).notNull(),
  
  lastReviewedAt: timestamp("last_reviewed_at"),
  nextReviewAt: timestamp("next_review_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  parentUserId: integer("parent_user_id").notNull(),
  studentProfileId: integer("student_profile_id").notNull(),
  
  relationship: varchar("relationship", { length: 50 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("MZN").notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),
  
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentReference: varchar("payment_reference", { length: 255 }),
  
  status: transactionStatusEnum("status").default("pending").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const parentReports = pgTable("parent_reports", {
  id: serial("id").primaryKey(),
  parentUserId: integer("parent_user_id").notNull(),
  studentProfileId: integer("student_profile_id").notNull(),
  
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  
  totalStudyTime: integer("total_study_time").default(0).notNull(),
  questionsAsked: integer("questions_asked").default(0).notNull(),
  exercisesCompleted: integer("exercises_completed").default(0).notNull(),
  averageAccuracy: integer("average_accuracy").default(0).notNull(),
  
  reportData: json("report_data").$type<{
    subjects: Array<{
      name: string;
      timeSpent: number;
      accuracy: number;
    }>;
    achievements: string[];
    areasOfConcern: string[];
  }>(),
  
  emailSent: boolean("email_sent").default(false).notNull(),
  emailSentAt: timestamp("email_sent_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type School = typeof schools.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
