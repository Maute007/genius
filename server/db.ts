import { eq, and, or, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, profiles, InsertProfile, schools, conversations, messages, learningProgress } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
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

// Profile functions
export async function createProfile(profile: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(profiles).values(profile);
  return result;
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

// School functions
export async function findOrCreateSchool(schoolData: {
  name: string;
  type: string;
  province: string;
  city: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const normalizedName = schoolData.name.toLowerCase().trim();

  // Try to find existing school
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

  // Create new school
  await db.insert(schools).values({
    name: schoolData.name,
    normalizedName,
    type: schoolData.type as any,
    province: schoolData.province,
    city: schoolData.city,
    totalStudents: 1,
    activeStudents: 1,
  });

  // Fetch the created school
  const created = await db
    .select()
    .from(schools)
    .where(
      and(
        eq(schools.normalizedName, normalizedName),
        eq(schools.province, schoolData.province)
      )
    )
    .limit(1);

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
    .where(sql`${schools.normalizedName} LIKE ${searchTerm}`)
    .limit(limit);

  return results;
}

// Conversation functions
export async function createConversation(data: {
  userId: number;
  profileId: number;
  mode: string;
  subject?: string;
  topic?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(conversations).values({
    ...data,
    mode: data.mode as any,
    isActive: true,
  });

  // Fetch the created conversation
  const created = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.userId, data.userId),
        eq(conversations.isActive, true)
      )
    )
    .orderBy(sql`${conversations.createdAt} DESC`)
    .limit(1);

  return created[0];
}

export async function getActiveConversation(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.isActive, true)))
    .orderBy(sql`${conversations.updatedAt} DESC`)
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
    .orderBy(sql`${conversations.updatedAt} DESC`)
    .limit(limit);
}

// Message functions
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

  // Update conversation timestamp
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, data.conversationId));

  // Auto-track learning progress when the user practices
  // If conversation has subject/topic and a profileId, increment practice
  try {
    if (data.role === "user") {
      const conv = await getConversationById(data.conversationId);
      if (conv?.profileId && (conv.subject || conv.topic)) {
        await updateLearningProgress({
          profileId: conv.profileId,
          subject: conv.subject || "Geral",
          topic: conv.topic || "Aprendizagem",
          // Increment practice count and totals (answers)
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

  // Verificar se a conversa pertence ao usuário
  const conversation = await getConversationById(conversationId);
  if (!conversation || conversation.userId !== userId) {
    throw new Error("Conversa não encontrada ou sem permissão");
  }

  // Deletar mensagens primeiro (foreign key)
  await db.delete(messages).where(eq(messages.conversationId, conversationId));
  
  // Deletar conversa
  await db.delete(conversations).where(eq(conversations.id, conversationId));
}

export async function deleteAllConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar todas as conversas do usuário
  const userConversations = await getUserConversations(userId);
  
  // Deletar mensagens de todas as conversas
  for (const conv of userConversations) {
    await db.delete(messages).where(eq(messages.conversationId, conv.id));
  }
  
  // Deletar todas as conversas
  await db.delete(conversations).where(eq(conversations.userId, userId));
}

export async function getConversationMessages(conversationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(sql`${messages.createdAt} ASC`)
    .limit(limit);
}

// Backwards-compatible wrappers (some routers expect these exact names)
export async function getConversationsByUserId(userId: number, limit = 20) {
  return await getUserConversations(userId, limit);
}

export async function getMessagesByConversationId(conversationId: number, limit = 50) {
  return await getConversationMessages(conversationId, limit);
}

// Learning progress functions
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

  // Check if progress exists
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
    // Update existing
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
    // Create new
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

// Usage tracking for free plan
export async function checkAndIncrementQuestionLimit(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await getUserById(userId);
  if (!user) return false;

  // If not free plan, allow unlimited
  if (user.plan !== "free") return true;

  // Check if we need to reset monthly counter
  const now = new Date();
  const lastReset = new Date(user.lastQuestionResetAt);
  const monthsSinceReset = 
    (now.getFullYear() - lastReset.getFullYear()) * 12 + 
    (now.getMonth() - lastReset.getMonth());

  if (monthsSinceReset >= 1) {
    // Reset counter
    await db
      .update(users)
      .set({
        monthlyQuestionsUsed: 1,
        lastQuestionResetAt: now,
      })
      .where(eq(users.id, userId));
    return true;
  }

  // Check limit
  if (user.monthlyQuestionsUsed >= 20) {
    return false; // Limit reached
  }

  // Increment counter
  await db
    .update(users)
    .set({
      monthlyQuestionsUsed: sql`${users.monthlyQuestionsUsed} + 1`,
    })
    .where(eq(users.id, userId));

  return true;
}



// Authentication functions for password-based login

export async function getUserByEmailOrPhone(identifier: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db
    .select()
    .from(users)
    .where(or(eq(users.email, identifier), eq(users.email, identifier))) // Check both email (phone stored in email field for now)
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

  const result = await db.insert(users).values({
    openId: data.openId,
    name: data.name,
    email: data.email,
    password: data.password,
    emailVerified: data.emailVerified,
    verificationToken: data.verificationToken,
    loginMethod: data.loginMethod,
    role: data.role,
    plan: data.plan,
  });

  // Get the created user
  const userId = Number(result[0].insertId);
  const user = await getUserById(userId);
  
  if (!user) throw new Error("Failed to create user");
  
  return user;
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

// Update user subscription details
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

// Admin Functions

// Get all users (admin only)
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

// Update user role (super_admin only)
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

// Update user plan (admin only)
export async function updateUserPlan(
  userId: number,
  plan: "free" | "student" | "student_plus" | "family"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiresAt = plan === "free" 
    ? null 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

  await db
    .update(users)
    .set({
      plan,
      subscriptionStatus: "active",
      subscriptionExpiresAt: expiresAt,
    })
    .where(eq(users.id, userId));
}

// Check if user is first user (to make super_admin)
export async function isFirstUser() {
  const db = await getDb();
  if (!db) return false;

  const count = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  return count[0]?.count === 0;
}
// (duplicate conversation/message helper functions removed)

