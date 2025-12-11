import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }), // Hashed password for direct login
  emailVerified: boolean("emailVerified").default(false).notNull(), // Email verification status
  verificationToken: varchar("verificationToken", { length: 255 }), // Token for email verification
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "super_admin"]).default("user").notNull(),
  
  // Subscription info
  plan: mysqlEnum("plan", ["free", "student", "student_plus", "family"]).default("free").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "expired", "cancelled"]).default("active").notNull(),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  
  // Usage tracking for free plan
  monthlyQuestionsUsed: int("monthlyQuestionsUsed").default(0).notNull(),
  lastQuestionResetAt: timestamp("lastQuestionResetAt").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Student profiles - the heart of personalization
 */
export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Personal info
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }), // For lead capture
  whatsapp: varchar("whatsapp", { length: 20 }), // For lead capture
  age: int("age").notNull(),
  grade: varchar("grade", { length: 50 }).notNull(), // "10ª classe", "3º ano Eng.", etc.
  interests: json("interests").$type<string[]>().notNull(), // ["futebol", "música", "ciência"]
  otherInterests: text("otherInterests"), // Free text for interests not in predefined list
  learningStyle: text("learningStyle"), // Free text about how they like to learn
  learningPreferences: json("learningPreferences").$type<string[]>(), // Predefined learning methods
  challenges: text("challenges"), // Academic challenges/difficulties
  studyGoals: text("studyGoals"), // Academic goals
  
  // School info (for lead generation)
  schoolName: varchar("schoolName", { length: 255 }).notNull(),
  schoolType: mysqlEnum("schoolType", ["self_learner", "non_student", "public_school", "private_school", "public_university", "private_university", "technical_institute", "other"]).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  // classSection removed - not needed
  
  // Profile completion
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Schools - aggregated from student profiles
 */
export const schools = mysqlTable("schools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  normalizedName: varchar("normalizedName", { length: 255 }).notNull(), // For matching/autocomplete
  type: mysqlEnum("type", ["public_school", "private_school", "public_university", "private_university", "technical_institute", "other"]).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  
  // Stats
  totalStudents: int("totalStudents").default(0).notNull(),
  activeStudents: int("activeStudents").default(0).notNull(),
  
  // Partnership status
  isPartner: boolean("isPartner").default(false).notNull(),
  partnerSince: timestamp("partnerSince"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * School leads for B2B sales
 */
export const schoolLeads = mysqlTable("schoolLeads", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("schoolId").notNull(),
  
  // Contact info
  contactPerson: varchar("contactPerson", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  
  // Sales pipeline
  status: mysqlEnum("status", ["not_contacted", "contacted", "interested", "negotiating", "partner", "rejected"]).default("not_contacted").notNull(),
  notes: text("notes"),
  lastContactDate: timestamp("lastContactDate"),
  
  // Metrics
  potentialRevenue: int("potentialRevenue").default(0).notNull(), // In MZN
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Conversations - chat sessions
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  profileId: int("profileId").notNull(),
  
  // Conversation metadata
  title: varchar("title", { length: 255 }), // Auto-generated or user-set
  mode: mysqlEnum("mode", ["quick_doubt", "exam_prep", "revision", "free_learning"]).notNull(),
  subject: varchar("subject", { length: 100 }), // "Matemática", "Física", etc.
  topic: varchar("topic", { length: 255 }), // "Equações do 2º grau"
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Messages - individual chat messages
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  
  // Message content
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  
  // Metadata
  tokens: int("tokens"), // For cost tracking
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Learning progress - track what students have mastered
 */
export const learningProgress = mysqlTable("learningProgress", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  
  // What was learned
  subject: varchar("subject", { length: 100 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  
  // Progress metrics
  masteryLevel: int("masteryLevel").default(0).notNull(), // 0-100
  practiceCount: int("practiceCount").default(0).notNull(),
  correctAnswers: int("correctAnswers").default(0).notNull(),
  totalAnswers: int("totalAnswers").default(0).notNull(),
  
  // Spaced repetition
  lastReviewedAt: timestamp("lastReviewedAt"),
  nextReviewAt: timestamp("nextReviewAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Achievements and gamification
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  
  // Achievement details
  type: varchar("type", { length: 100 }).notNull(), // "streak_7_days", "mastered_topic", etc.
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

/**
 * Family accounts - link multiple students to parent account
 */
export const familyMembers = mysqlTable("familyMembers", {
  id: int("id").autoincrement().primaryKey(),
  parentUserId: int("parentUserId").notNull(), // The paying account
  studentProfileId: int("studentProfileId").notNull(),
  
  // Relationship
  relationship: varchar("relationship", { length: 50 }), // "filho", "filha", "outro"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Payment transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Transaction details
  amount: int("amount").notNull(), // In MZN cents (e.g., 50000 = 500 MZN)
  currency: varchar("currency", { length: 3 }).default("MZN").notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),
  
  // Payment method
  paymentMethod: mysqlEnum("paymentMethod", ["mpesa", "emola", "mkesh", "manual"]).notNull(),
  paymentReference: varchar("paymentReference", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Parent reports - weekly summaries
 */
export const parentReports = mysqlTable("parentReports", {
  id: int("id").autoincrement().primaryKey(),
  parentUserId: int("parentUserId").notNull(),
  studentProfileId: int("studentProfileId").notNull(),
  
  // Report period
  weekStart: timestamp("weekStart").notNull(),
  weekEnd: timestamp("weekEnd").notNull(),
  
  // Metrics
  totalStudyTime: int("totalStudyTime").default(0).notNull(), // In minutes
  questionsAsked: int("questionsAsked").default(0).notNull(),
  exercisesCompleted: int("exercisesCompleted").default(0).notNull(),
  averageAccuracy: int("averageAccuracy").default(0).notNull(), // 0-100
  
  // Report data (JSON)
  reportData: json("reportData").$type<{
    subjects: Array<{
      name: string;
      timeSpent: number;
      accuracy: number;
    }>;
    achievements: string[];
    areasOfConcern: string[];
  }>(),
  
  // Delivery status
  emailSent: boolean("emailSent").default(false).notNull(),
  emailSentAt: timestamp("emailSentAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type School = typeof schools.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

