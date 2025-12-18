import { eq, and, or, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { InsertUser, users, profiles, InsertProfile, schools, conversations, messages, learningProgress } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _migrationRan = false;
let _dbReady = false;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function ensureDbReady(): Promise<boolean> {
  if (_dbReady) return true;
  
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const db = await getDb();
      if (!db) {
        console.warn(`[Database] No database URL configured`);
        return false;
      }
      
      await db.execute(sql`SELECT 1`);
      _dbReady = true;
      console.log(`[Database] Connection verified (attempt ${attempt})`);
      return true;
    } catch (error) {
      console.error(`[Database] Connection attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  return false;
}

export function isDbReady(): boolean {
  return _dbReady;
}

export async function runMigrations() {
  if (_migrationRan) return;
  _migrationRan = true;

  const db = await getDb();
  if (!db) {
    console.warn("[Migration] Database not available, skipping migrations");
    return;
  }

  console.log("[Migration] Running schema migrations...");

  try {
    // Create enums if they don't exist
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('user', 'admin', 'super_admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE plan AS ENUM ('free', 'student', 'student_plus', 'family');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("[Migration] Enums ensured");

    // Ensure users table exists with all columns
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        open_id VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        password VARCHAR(255),
        email_verified BOOLEAN DEFAULT false NOT NULL,
        verification_token VARCHAR(255),
        login_method VARCHAR(64),
        role role DEFAULT 'user' NOT NULL,
        plan plan DEFAULT 'free' NOT NULL,
        subscription_status subscription_status DEFAULT 'active' NOT NULL,
        subscription_expires_at TIMESTAMP WITH TIME ZONE,
        monthly_questions_used INTEGER DEFAULT 0 NOT NULL,
        last_question_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        last_signed_in TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    console.log("[Migration] Users table ensured");

    // Ensure profiles table exists with all columns
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL UNIQUE,
        full_name VARCHAR(255),
        email VARCHAR(320),
        whatsapp VARCHAR(20),
        age INTEGER,
        grade VARCHAR(50),
        interests JSONB,
        other_interests TEXT,
        learning_style TEXT,
        learning_preferences JSONB,
        challenges TEXT,
        study_goals TEXT,
        school_name VARCHAR(255),
        school_type VARCHAR(50),
        province VARCHAR(100),
        city VARCHAR(100),
        onboarding_completed BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    console.log("[Migration] Profiles table ensured");

    // Add any missing columns to profiles
    await db.execute(sql`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
      ADD COLUMN IF NOT EXISTS other_interests TEXT,
      ADD COLUMN IF NOT EXISTS learning_style TEXT,
      ADD COLUMN IF NOT EXISTS learning_preferences JSONB,
      ADD COLUMN IF NOT EXISTS challenges TEXT,
      ADD COLUMN IF NOT EXISTS study_goals TEXT,
      ADD COLUMN IF NOT EXISTS school_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS school_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100)
    `);
    console.log("[Migration] Profiles columns updated");

    // Migrate interests to JSONB if needed
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          AND column_name = 'interests' 
          AND data_type = 'text'
        ) THEN
          ALTER TABLE profiles 
          ALTER COLUMN interests TYPE jsonb 
          USING CASE 
            WHEN interests IS NULL OR interests = '' THEN '[]'::jsonb
            WHEN interests LIKE '[%' THEN interests::jsonb
            ELSE jsonb_build_array(interests)
          END;
        END IF;
      END $$
    `);
    console.log("[Migration] Interests column type ensured as JSONB");

    // Ensure conversations table exists with all required columns
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        profile_id INTEGER NOT NULL,
        title VARCHAR(255),
        mode VARCHAR(50) NOT NULL DEFAULT 'quick_doubt',
        subject VARCHAR(100),
        topic VARCHAR(255),
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    
    // Add missing columns to conversations if they don't exist
    await db.execute(sql`
      ALTER TABLE conversations 
      ADD COLUMN IF NOT EXISTS user_id BIGINT,
      ADD COLUMN IF NOT EXISTS profile_id INTEGER
    `);
    console.log("[Migration] Conversations table ensured");

    // Ensure messages table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        tokens INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    console.log("[Migration] Messages table ensured");

    // Ensure sessions table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        token VARCHAR(512) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `);
    console.log("[Migration] Sessions table ensured");

    console.log("[Migration] All migrations completed successfully");
  } catch (error) {
    console.error("[Migration] Error running migrations:", error);
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existingUser.length > 0) {
      const updateSet: Record<string, unknown> = {};
      
      if (user.name !== undefined) updateSet.name = user.name ?? null;
      if (user.email !== undefined) updateSet.email = user.email ?? null;
      if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod ?? null;
      if (user.lastSignedIn !== undefined) updateSet.lastSignedIn = user.lastSignedIn;
      if (user.role !== undefined) updateSet.role = user.role;
      
      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }
      
      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      const now = new Date();
      const values: InsertUser = {
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        emailVerified: false,
        role: user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user'),
        plan: "free",
        subscriptionStatus: "active",
        monthlyQuestionsUsed: 0,
        lastQuestionResetAt: now,
        createdAt: now,
        updatedAt: now,
        lastSignedIn: user.lastSignedIn ?? now,
      };
      
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProfile(profile: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const result = await db.insert(profiles).values({
    ...profile,
    createdAt: now,
    updatedAt: now,
  }).returning();
  return result[0];
}

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProfile(userId: number, updates: Partial<InsertProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(profiles).set(updates).where(eq(profiles.userId, userId));
}

export async function findOrCreateSchool(schoolData: {
  name: string;
  type: string;
  province: string;
  city: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const normalizedName = schoolData.name.toLowerCase().trim();

  const existing = await db
    .select()
    .from(schools)
    .where(
      and(
        eq(schools.normalizedName, normalizedName),
        eq(schools.province, schoolData.province)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const created = await db.insert(schools).values({
    name: schoolData.name,
    normalizedName,
    type: schoolData.type as any,
    province: schoolData.province,
    city: schoolData.city,
    totalStudents: 1,
    activeStudents: 1,
  }).returning();

  return created[0];
}

export async function incrementSchoolStudents(schoolId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(schools)
    .set({
      totalStudents: sql`${schools.totalStudents} + 1`,
      activeStudents: sql`${schools.activeStudents} + 1`,
    })
    .where(eq(schools.id, schoolId));
}

export async function searchSchools(query: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const searchTerm = `%${query.toLowerCase()}%`;

  const results = await db
    .select()
    .from(schools)
    .where(sql`${schools.normalizedName} ILIKE ${searchTerm}`)
    .limit(limit);

  return results;
}

export async function createConversation(data: {
  userId: number;
  profileId: number;
  mode: string;
  subject?: string;
  topic?: string;
  title?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const created = await db.insert(conversations).values({
    userId: data.userId,
    profileId: data.profileId,
    mode: data.mode as any,
    title: data.title || "Nova conversa",
    subject: data.subject,
    topic: data.topic,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }).returning();

  return created[0];
}

export async function getActiveConversation(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.isActive, true)))
    .orderBy(desc(conversations.updatedAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserConversations(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit);
}

export async function addMessage(data: {
  conversationId: number;
  role: "user" | "assistant" | "system";
  content: string;
  tokens?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(messages).values({
    ...data,
    role: data.role as any,
  });

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, data.conversationId));

  try {
    if (data.role === "user") {
      const conv = await getConversationById(data.conversationId);
      if (conv?.profileId && (conv.subject || conv.topic)) {
        await updateLearningProgress({
          profileId: conv.profileId,
          subject: conv.subject || "Geral",
          topic: conv.topic || "Aprendizagem",
          totalAnswers: 1,
        });
      }
    }
  } catch (err) {
    console.warn("[LearningProgress] Failed to update:", err);
  }
}

export async function getConversationById(conversationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateConversationTitle(conversationId: number, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));
}

export async function deleteConversation(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conversation = await getConversationById(conversationId);
  if (!conversation || conversation.userId !== userId) {
    throw new Error("Conversa não encontrada ou sem permissão");
  }

  await db.delete(messages).where(eq(messages.conversationId, conversationId));
  await db.delete(conversations).where(eq(conversations.id, conversationId));
}

export async function deleteAllConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userConversations = await getUserConversations(userId);
  
  for (const conv of userConversations) {
    await db.delete(messages).where(eq(messages.conversationId, conv.id));
  }
  
  await db.delete(conversations).where(eq(conversations.userId, userId));
}

export async function getConversationMessages(conversationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)
    .limit(limit);
}

export async function getConversationsByUserId(userId: number, limit = 20) {
  return await getUserConversations(userId, limit);
}

export async function getMessagesByConversationId(conversationId: number, limit = 50) {
  return await getConversationMessages(conversationId, limit);
}

export async function updateLearningProgress(data: {
  profileId: number;
  subject: string;
  topic: string;
  masteryLevel?: number;
  correctAnswers?: number;
  totalAnswers?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(learningProgress)
    .where(
      and(
        eq(learningProgress.profileId, data.profileId),
        eq(learningProgress.subject, data.subject),
        eq(learningProgress.topic, data.topic)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const updates: any = {
      practiceCount: sql`${learningProgress.practiceCount} + 1`,
      lastReviewedAt: new Date(),
    };

    if (data.masteryLevel !== undefined) {
      updates.masteryLevel = data.masteryLevel;
    }
    if (data.correctAnswers !== undefined) {
      updates.correctAnswers = sql`${learningProgress.correctAnswers} + ${data.correctAnswers}`;
    }
    if (data.totalAnswers !== undefined) {
      updates.totalAnswers = sql`${learningProgress.totalAnswers} + ${data.totalAnswers}`;
    }

    await db
      .update(learningProgress)
      .set(updates)
      .where(eq(learningProgress.id, existing[0].id));
  } else {
    await db.insert(learningProgress).values({
      profileId: data.profileId,
      subject: data.subject,
      topic: data.topic,
      masteryLevel: data.masteryLevel || 0,
      practiceCount: 1,
      correctAnswers: data.correctAnswers || 0,
      totalAnswers: data.totalAnswers || 0,
      lastReviewedAt: new Date(),
    });
  }
}

export async function checkAndIncrementQuestionLimit(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await getUserById(userId);
  if (!user) return false;

  if (user.plan !== "free") return true;

  const now = new Date();
  const lastReset = new Date(user.lastQuestionResetAt);
  const monthsSinceReset = 
    (now.getFullYear() - lastReset.getFullYear()) * 12 + 
    (now.getMonth() - lastReset.getMonth());

  if (monthsSinceReset >= 1) {
    await db
      .update(users)
      .set({
        monthlyQuestionsUsed: 1,
        lastQuestionResetAt: now,
      })
      .where(eq(users.id, userId));
    return true;
  }

  if (user.monthlyQuestionsUsed >= 20) {
    return false;
  }

  await db
    .update(users)
    .set({
      monthlyQuestionsUsed: sql`${users.monthlyQuestionsUsed} + 1`,
    })
    .where(eq(users.id, userId));

  return true;
}

export async function getUserByEmailOrPhone(identifier: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db
    .select()
    .from(users)
    .where(or(eq(users.email, identifier), eq(users.email, identifier)))
    .limit(1);

  return user[0] || null;
}

export async function createUser(data: {
  openId: string;
  name: string;
  email?: string;
  password?: string;
  emailVerified?: boolean;
  verificationToken?: string;
  loginMethod: string;
  role?: "user" | "admin" | "super_admin";
  plan?: "free" | "student" | "student_plus" | "family";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const result = await db.insert(users).values({
    openId: data.openId,
    name: data.name,
    email: data.email,
    password: data.password,
    emailVerified: data.emailVerified ?? false,
    verificationToken: data.verificationToken,
    loginMethod: data.loginMethod,
    role: data.role ?? "user",
    plan: data.plan ?? "free",
    subscriptionStatus: "active",
    monthlyQuestionsUsed: 0,
    lastQuestionResetAt: now,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  }).returning();

  return result[0];
}

export async function updateUserPassword(userId: number, hashedPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId));
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

export async function getUserByVerificationToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.verificationToken, token))
    .limit(1);

  return user[0] || null;
}

export async function verifyUserEmail(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ 
      emailVerified: true,
      verificationToken: null,
    })
    .where(eq(users.id, userId));
}

export async function updateUserVerificationToken(userId: number, verificationToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ verificationToken })
    .where(eq(users.id, userId));
}

export async function updateUserSubscription(
  userId: number,
  subscription: {
    plan: "free" | "student" | "student_plus" | "family";
    status: "active" | "expired" | "cancelled";
    expiresAt: Date | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      plan: subscription.plan,
      subscriptionStatus: subscription.status,
      subscriptionExpiresAt: subscription.expiresAt,
    })
    .where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      plan: users.plan,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionExpiresAt: users.subscriptionExpiresAt,
      monthlyQuestionsUsed: users.monthlyQuestionsUsed,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return allUsers;
}

export async function updateUserRole(
  userId: number,
  role: "user" | "admin" | "super_admin"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId));
}

export async function updateUserPlan(
  userId: number,
  plan: "free" | "student" | "student_plus" | "family"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiresAt = plan === "free" 
    ? null 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db
    .update(users)
    .set({
      plan,
      subscriptionStatus: "active",
      subscriptionExpiresAt: expiresAt,
    })
    .where(eq(users.id, userId));
}

export async function isFirstUser() {
  const db = await getDb();
  if (!db) return false;

  const count = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  return count[0]?.count === 0;
}
