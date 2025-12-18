import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { authRouter } from "./auth-router";
import { adminRouter } from "./admin-router";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(() => {
      // Simple logout - just return success
      // Client will remove token from localStorage
      return {
        success: true,
      } as const;
    }),
    // Password-based authentication
    ...authRouter._def.procedures,
  }),

  // Admin routes
  admin: adminRouter,

  profile: router({
    // Get current user's profile
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      return profile;
    }),

    // Create or update profile (onboarding)
    upsert: protectedProcedure
      .input(
        z.object({
          fullName: z.string().min(2),
          email: z.string().email().optional(),
          whatsapp: z.string().optional(),
          age: z.number().min(5).max(100),
          grade: z.string(),
          interests: z.array(z.string()).min(1),
          otherInterests: z.string().optional(),
          learningStyle: z.string().optional(),
          learningPreferences: z.array(z.string()).optional(),
          challenges: z.string().optional(),
          studyGoals: z.string().optional(),
          schoolName: z.string().min(2),
          schoolType: z.enum([
            "self_learner",
            "non_student",
            "public_school",
            "private_school",
            "public_university",
            "private_university",
            "technical_institute",
            "other",
          ]),
          province: z.string(),
          city: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          console.log(`[Profile] Upsert started for user ${ctx.user.id}`);
          
          // Find or create school
          let school;
          try {
            school = await db.findOrCreateSchool({
              name: input.schoolName,
              type: input.schoolType,
              province: input.province,
              city: input.city,
            });
            console.log(`[Profile] School found/created: ${school?.id}`);
          } catch (schoolError) {
            console.error("[Profile] Error with school:", schoolError);
            // Continue without school - not critical for profile save
            school = null;
          }

          // Check if profile exists
          const existing = await db.getProfileByUserId(ctx.user.id);
          console.log(`[Profile] Existing profile: ${existing ? 'yes' : 'no'}`);

          if (existing) {
            // Update existing profile
            await db.updateProfile(ctx.user.id, {
              ...input,
              onboardingCompleted: true,
            });
            console.log(`[Profile] Profile updated for user ${ctx.user.id}`);
          } else {
            // Create new profile
            await db.createProfile({
              userId: ctx.user.id,
              ...input,
              onboardingCompleted: true,
            });
            console.log(`[Profile] Profile created for user ${ctx.user.id}`);

            // Increment school student count (only if school exists)
            if (school?.id) {
              try {
                await db.incrementSchoolStudents(school.id);
              } catch (incrementError) {
                console.error("[Profile] Error incrementing school students:", incrementError);
              }
            }
          }

          return { success: true };
        } catch (error) {
          console.error("[Profile] Upsert error:", error);
          throw error;
        }
      }),

    // Search schools for autocomplete
    searchSchools: publicProcedure
      .input(z.object({ query: z.string().min(2) }))
      .query(async ({ input }) => {
        const schools = await db.searchSchools(input.query);
        return schools;
      }),
  }),

  chat: router({
    // Get or create active conversation
    getActive: protectedProcedure
      .input(
        z.object({
          mode: z.enum(["quick_doubt", "exam_prep", "revision", "free_learning"]),
        })
      )
      .query(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new Error("Profile not found. Please complete onboarding first.");
        }

        // Check plan access
        const hasAccess = checkModeAccess(ctx.user.plan, input.mode);
        if (!hasAccess) {
          throw new Error("This mode is not available in your current plan. Please upgrade.");
        }

        let conversation = await db.getActiveConversation(ctx.user.id);

        if (!conversation) {
          conversation = await db.createConversation({
            userId: ctx.user.id,
            profileId: profile.id,
            mode: input.mode,
          });
        }

        const messages = await db.getConversationMessages(conversation.id);

        return {
          conversation,
          messages,
          profile,
        };
      }),

    // List all conversations
    listConversations: protectedProcedure.query(async ({ ctx }) => {
      const conversations = await db.getUserConversations(ctx.user.id);
      return conversations;
    }),

    // Get conversation by ID with messages
    getConversationById: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
        })
      )
      .query(async ({ ctx, input }) => {
        const conversation = await db.getConversationById(input.conversationId);
        
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Conversa não encontrada ou sem permissão");
        }

        const messages = await db.getConversationMessages(input.conversationId);

        return {
          conversation,
          messages,
        };
      }),

    // Create new conversation
    createConversation: protectedProcedure
      .input(
        z.object({
          mode: z.enum(["quick_doubt", "exam_prep", "revision", "free_learning"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new Error("Profile not found. Please complete onboarding first.");
        }

        // Check plan access
        const hasAccess = checkModeAccess(ctx.user.plan, input.mode);
        if (!hasAccess) {
          throw new Error("This mode is not available in your current plan. Please upgrade.");
        }

        const conversation = await db.createConversation({
          userId: ctx.user.id,
          profileId: profile.id,
          mode: input.mode,
        });

        return conversation;
      }),

    // Get conversation history (deprecated - use listConversations)
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const conversations = await db.getUserConversations(ctx.user.id);
      return conversations;
    }),

    // Send message and get AI response
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // LIMITE REMOVIDO: Chat agora é completamente aberto para todos
        // const canAsk = await db.checkAndIncrementQuestionLimit(ctx.user.id);
        // if (!canAsk) {
        //   throw new Error(
        //     "You have reached your monthly question limit (100 questions). Please upgrade to continue learning."
        //   );
        // }

        // Get profile and conversation
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Profile not found");

        // Save user message
        await db.addMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.message,
        });

        // Get conversation history
        const messages = await db.getConversationMessages(input.conversationId);
        const conversation = await db.getConversationById(input.conversationId);
        const mode = conversation?.mode || 'quick_doubt';

        // Build context for LLM
        let systemPrompt = buildSystemPrompt(profile);
        
        // Try to enhance with RAG context (optional)
        try {
          const { getRAGContext, enhanceSystemPrompt } = await import('./rag');
          const ragContext = await getRAGContext(input.message, mode, profile);
          systemPrompt = enhanceSystemPrompt(systemPrompt, ragContext);
          
          if (ragContext.hasRelevantContent) {
            console.log('RAG: Found relevant content from Mozambican educational material');
          }
        } catch (error) {
          // RAG is optional - if it fails, continue with base prompt
          console.log('RAG not available or failed, using base prompt:', error);
        }

        const conversationMessages = messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));

        // Call LLM
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationMessages,
          ],
        });

        const assistantMessage = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : "Desculpa, não consegui processar a tua pergunta.";

        // Save assistant response
        await db.addMessage({
          conversationId: input.conversationId,
          role: "assistant",
          content: assistantMessage,
          tokens: response.usage?.total_tokens,
        });

        // Generate title if this is the first user message
        if (!conversation?.title && messages.length === 0) {
          // This is the first message, generate a title
          try {
            const titleResponse = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: "Gera um título curto e descritivo (máximo 5 palavras) para esta conversa educacional. Responde APENAS com o título, sem aspas ou pontuação extra. Exemplos: 'Álgebra - Equações', 'Geometria - Triângulos', 'Física - Movimento'.",
                },
                {
                  role: "user",
                  content: input.message,
                },
              ],
            });

            const title = typeof titleResponse.choices[0].message.content === 'string'
              ? titleResponse.choices[0].message.content.trim().replace(/["']/g, '')
              : null;

            if (title) {
              await db.updateConversationTitle(input.conversationId, title);
            }
          } catch (error) {
            console.error("Failed to generate conversation title:", error);
            // Don't fail the whole request if title generation fails
          }
        }

        return {
          message: assistantMessage,
        };
      }),

    // Update conversation title
    updateTitle: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          title: z.string().min(1).max(255),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const conversation = await db.getConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Conversation not found or access denied");
        }

        await db.updateConversationTitle(input.conversationId, input.title);

        return {
          success: true,
        };
      }),

    // Delete specific conversation
    deleteConversation: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.deleteConversation(input.conversationId, ctx.user.id);
        return {
          success: true,
        };
      }),

    // Delete all conversations (clear history)
    deleteAllConversations: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deleteAllConversations(ctx.user.id);
      return {
        success: true,
      };
    }),
  }),

  subscription: router({
    // Get current subscription status
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new Error("User not found");

      return {
        plan: user.plan,
        status: user.subscriptionStatus,
        expiresAt: user.subscriptionExpiresAt,
        questionsUsed: user.monthlyQuestionsUsed,
        questionsLimit: user.plan === "free" ? 100 : null,
      };
    }),

    // Process mock payment (fictitious payment processing)
    processMockPayment: protectedProcedure
      .input(
        z.object({
          planId: z.enum(["free", "student", "student_plus", "family"]),
          paymentMethod: z.enum(["mpesa", "emola", "mkesh"]),
          phoneNumber: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user) throw new Error("User not found");

        // Simular processamento de pagamento (fictício)
        // Em produção, aqui seria feita a integração com M-Pesa/E-Mola/Mkesh
        console.log(`[MOCK PAYMENT] Processing payment for user ${user.id}:`, {
          plan: input.planId,
          method: input.paymentMethod,
          phone: input.phoneNumber,
        });

        // Simular delay de processamento
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Atualizar plano do usuário
        const expiresAt = input.planId === "free" 
          ? null 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

        await db.updateUserSubscription(ctx.user.id, {
          plan: input.planId,
          status: "active",
          expiresAt,
        });

        return {
          success: true,
          message: `Pagamento processado com sucesso! Plano ${input.planId} activado.`,
          plan: input.planId,
          expiresAt,
        };
      }),

    // Upgrade plan (placeholder - will integrate with payment later)
    upgrade: protectedProcedure
      .input(
        z.object({
          plan: z.enum(["student", "student_plus", "family"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: Integrate with M-Pesa/E-Mola payment
        // For now, just a placeholder
        return {
          success: true,
          message: "Payment integration coming soon. Please contact support.",
        };
      }),
  }),

  // Dashboard & Statistics
  dashboard: router({
    // Get user statistics
    stats: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("Profile not found");
      }

      // Get current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get conversations count for this month
      const conversations = await db.getConversationsByUserId(ctx.user.id);
      const monthlyConversations = conversations.filter(
        (c) => new Date(c.createdAt) >= firstDayOfMonth
      );

      // Get total messages (as proxy for questions asked)
      let totalQuestions = 0;
      for (const conv of monthlyConversations) {
        const messages = await db.getMessagesByConversationId(conv.id);
        totalQuestions += messages.filter((m) => m.role === "user").length;
      }

      // Calculate study time (estimate: 2 minutes per question)
      const studyTimeMinutes = totalQuestions * 2;

      // Calculate progress (simple: number of topics covered)
      const progress = monthlyConversations.length;

      return {
        questionsThisMonth: totalQuestions,
        studyTimeMinutes,
        progress,
      };
    }),

    // Get recent conversations with enhanced data
    recentConversations: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(50).default(10),
        })
      )
      .query(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new Error("Profile not found");
        }

        const conversations = await db.getConversationsByUserId(ctx.user.id);
        
        // Sort by most recent and limit
        const recent = conversations
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, input.limit);

        // Enhance each conversation with message count and preview
        const enhanced = await Promise.all(
          recent.map(async (conv) => {
            const messages = await db.getMessagesByConversationId(conv.id);
            const userMessages = messages.filter(m => m.role === "user");
            const lastUserMessage = userMessages[userMessages.length - 1];

            return {
              ...conv,
              messageCount: messages.length,
              userMessageCount: userMessages.length,
              lastMessagePreview: lastUserMessage?.content?.slice(0, 100) || "",
              hasMessages: messages.length > 0,
            };
          })
        );

        return enhanced;
      }),

    // Generate personalized insights based on user profile and activity
    personalizedInsights: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("Profile not found");
      }

      // Get user's recent activity
      const conversations = await db.getConversationsByUserId(ctx.user.id, 20);
      const recentConversations = conversations
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10);

      // Count subjects studied
      const subjectsStudied = new Set(
        conversations.filter(c => c.subject).map(c => c.subject)
      );

      // Get learning progress
      const dbConn = await db.getDb();
      let progressData: Array<{
        subject: string;
        topic: string;
        masteryLevel: number | null;
        practiceCount: number | null;
      }> = [];
      if (dbConn) {
        const { learningProgress } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");

        progressData = await dbConn
          .select()
          .from(learningProgress)
          .where(eq(learningProgress.profileId, profile.id))
          .orderBy(desc(learningProgress.lastReviewedAt))
          .limit(10);
      }

      // Build context for Claude to generate insights
      const userContext = `
PERFIL DO ESTUDANTE:
- Nome: ${profile.fullName}
- Idade: ${profile.age} anos
- Classe/Nível: ${profile.grade}
- Interesses: ${profile.interests.join(", ")}${profile.otherInterests ? ` (outros: ${profile.otherInterests})` : ""}
- Preferências de aprendizagem: ${profile.learningPreferences?.join(", ") || "Não especificado"}
- Dificuldades: ${profile.challenges || "Não especificado"}
- Objetivos: ${profile.studyGoals || "Não especificado"}
- Escola: ${profile.schoolName} (${profile.city}, ${profile.province})

ATIVIDADE RECENTE:
- Total de conversas: ${conversations.length}
- Conversas recentes: ${recentConversations.length}
- Assuntos estudados: ${subjectsStudied.size > 0 ? Array.from(subjectsStudied).join(", ") : "Nenhum ainda"}
- Modos utilizados: ${Array.from(new Set(conversations.map(c => c.mode))).join(", ")}

PROGRESSO DE APRENDIZAGEM:
${progressData.length > 0 
  ? progressData.map(p => `- ${p.subject}: ${p.topic} (${p.masteryLevel || 0}% domínio, ${p.practiceCount || 0} práticas)`).join("\n")
  : "- Ainda não há dados de progresso registados"
}
      `.trim();

      // Generate insights using Claude
      try {
        const insightResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `És um assistente educacional que analisa o progresso de estudantes e gera insights personalizados e motivadores.
              
TAREFA:
Com base no perfil e atividade do estudante, gera 3-5 insights curtos e motivadores em português de Moçambique.
Cada insight deve ter 1-2 frases e focar em:
1. Reconhecer o progresso atual
2. Conectar com os interesses do estudante
3. Sugerir próximos passos baseados nas dificuldades e objetivos
4. Ser específico e personalizado

FORMATO:
Retorna APENAS uma lista JSON com os insights, sem texto adicional.
Exemplo: ["Insight 1...", "Insight 2...", "Insight 3..."]`,
            },
            {
              role: "user",
              content: userContext,
            },
          ],
        });

        const insightContent = insightResponse.choices[0].message.content;
        let insights: string[] = [];

        if (typeof insightContent === "string") {
          try {
            // Try to parse as JSON
            const parsed = JSON.parse(insightContent);
            insights = Array.isArray(parsed) ? parsed : [insightContent];
          } catch {
            // If not JSON, split by newlines or use as single insight
            insights = insightContent.split("\n").filter(line => line.trim().length > 0);
          }
        }

        return {
          insights: insights.slice(0, 5), // Max 5 insights
          generatedAt: new Date(),
          profileSummary: {
            totalConversations: conversations.length,
            subjectsStudied: Array.from(subjectsStudied),
            recentActivity: recentConversations.length,
            progressItems: progressData.length,
          },
        };
      } catch (error) {
        console.error("Failed to generate insights:", error);
        
        // Fallback to static insights based on profile
        const fallbackInsights = [];
        
        if (conversations.length === 0) {
          fallbackInsights.push(`Bem-vindo ao Genius, ${profile.fullName}! Começa a tua jornada de aprendizagem fazendo a tua primeira pergunta.`);
        } else if (conversations.length < 5) {
          fallbackInsights.push(`Estás a começar bem! Já tens ${conversations.length} conversas. Continua a explorar.`);
        } else {
          fallbackInsights.push(`Excelente progresso! Já tens ${conversations.length} conversas no Genius.`);
        }

        if (profile.interests.length > 0) {
          fallbackInsights.push(`Os teus interesses em ${profile.interests.slice(0, 2).join(" e ")} podem ser ótimos pontos de partida para novos tópicos.`);
        }

        if (profile.studyGoals) {
          fallbackInsights.push(`Lembra-te do teu objetivo: ${profile.studyGoals}. Cada pergunta te aproxima dele!`);
        }

        if (subjectsStudied.size > 0) {
          fallbackInsights.push(`Tens estudado ${Array.from(subjectsStudied).join(", ")}. Que tal explorar um novo assunto?`);
        }

        return {
          insights: fallbackInsights.slice(0, 5),
          generatedAt: new Date(),
          profileSummary: {
            totalConversations: conversations.length,
            subjectsStudied: Array.from(subjectsStudied),
            recentActivity: recentConversations.length,
            progressItems: progressData.length,
          },
        };
      }
    }),

    // Recommended review topics based on learningProgress and onboarding
    reviewTopics: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(50).default(6),
        })
      )
      .query(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Profile not found");

        // Fetch learning progress entries for this profile
        const dbConn = await db.getDb();
        if (!dbConn) return [];

        const { learningProgress } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");

        const rows = await dbConn
          .select()
          .from(learningProgress)
          .where(eq(learningProgress.profileId, profile.id))
          .orderBy(desc(learningProgress.lastReviewedAt))
          .limit(input.limit);

        // Map to frontend-friendly shape
        return rows.map((r) => ({
          subject: r.subject,
          topic: r.topic,
          masteryLevel: r.masteryLevel ?? 0,
          lastReviewedAt: r.lastReviewedAt,
          practiceCount: r.practiceCount ?? 0,
        }));
      }),
  }),

  // Revision system based on actual conversations
  revision: router({
    // Get topics from user's conversation history for review
    getReviewTopics: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(50).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new Error("Profile not found");
        }

        // Get all user conversations
        const conversations = await db.getConversationsByUserId(ctx.user.id, 100);
        
        if (conversations.length === 0) {
          return {
            topics: [],
            hasConversations: false,
            message: "Ainda não tens conversas. Começa a estudar para poderes rever depois!",
          };
        }

        // Get learning progress for this user
        const dbConn = await db.getDb();
        let progressData: Array<{
          id: number;
          subject: string;
          topic: string;
          masteryLevel: number | null;
          practiceCount: number | null;
          lastReviewedAt: Date | null;
          correctAnswers: number | null;
          totalAnswers: number | null;
        }> = [];

        if (dbConn) {
          const { learningProgress } = await import("../drizzle/schema");
          const { eq, desc } = await import("drizzle-orm");

          progressData = await dbConn
            .select()
            .from(learningProgress)
            .where(eq(learningProgress.profileId, profile.id))
            .orderBy(desc(learningProgress.lastReviewedAt))
            .limit(100);
        }

        // Extract unique topics from conversations
        const topicsFromConversations = conversations
          .filter(conv => conv.subject || conv.topic)
          .map(conv => ({
            conversationId: conv.id,
            subject: conv.subject || "Geral",
            topic: conv.topic || conv.title || "Aprendizagem",
            mode: conv.mode,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
          }));

        // Merge with learning progress data
        const topicsMap = new Map<string, any>();

        // Add topics from learning progress (priority)
        for (const progress of progressData) {
          const key = `${progress.subject}::${progress.topic}`;
          topicsMap.set(key, {
            subject: progress.subject,
            topic: progress.topic,
            masteryLevel: progress.masteryLevel || 0,
            practiceCount: progress.practiceCount || 0,
            lastReviewedAt: progress.lastReviewedAt,
            correctAnswers: progress.correctAnswers || 0,
            totalAnswers: progress.totalAnswers || 0,
            hasProgress: true,
            conversationIds: [],
          });
        }

        // Add topics from conversations
        for (const conv of topicsFromConversations) {
          const key = `${conv.subject}::${conv.topic}`;
          
          if (topicsMap.has(key)) {
            // Update existing
            const existing = topicsMap.get(key);
            existing.conversationIds.push(conv.conversationId);
          } else {
            // Create new entry
            topicsMap.set(key, {
              subject: conv.subject,
              topic: conv.topic,
              masteryLevel: 0,
              practiceCount: 1,
              lastReviewedAt: conv.updatedAt,
              correctAnswers: 0,
              totalAnswers: 0,
              hasProgress: false,
              conversationIds: [conv.conversationId],
            });
          }
        }

        // Convert to array and calculate review priority
        const now = new Date();
        const topics = Array.from(topicsMap.values()).map(topic => {
          const daysSinceReview = topic.lastReviewedAt
            ? Math.floor((now.getTime() - new Date(topic.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24))
            : 999;

          // Calculate priority score (higher = more urgent to review)
          let priorityScore = 0;
          priorityScore += (100 - topic.masteryLevel) * 0.5;
          priorityScore += Math.min(daysSinceReview * 10, 100);
          priorityScore += Math.min(topic.practiceCount * 5, 50);

          // Determine next review recommendation
          let nextReview = "Hoje";
          if (topic.masteryLevel >= 90 && daysSinceReview < 7) {
            nextReview = "Daqui a 1 semana";
          } else if (topic.masteryLevel >= 75 && daysSinceReview < 3) {
            nextReview = "Daqui a 3 dias";
          } else if (daysSinceReview < 1) {
            nextReview = "Amanhã";
          }

          return {
            ...topic,
            daysSinceReview,
            priorityScore,
            nextReview,
            accuracy: topic.totalAnswers > 0 
              ? Math.round((topic.correctAnswers / topic.totalAnswers) * 100)
              : 0,
          };
        });

        // Sort by priority score (descending)
        topics.sort((a, b) => b.priorityScore - a.priorityScore);

        return {
          topics: topics.slice(0, input.limit),
          hasConversations: true,
          totalTopics: topics.length,
          profileInterests: profile.interests,
        };
      }),

    // Generate personalized review suggestions with Claude
    getSmartSuggestions: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("Profile not found");
      }

      const conversations = await db.getConversationsByUserId(ctx.user.id);
      
      if (conversations.length === 0) {
        return {
          suggestions: [
            "Começa a estudar para gerares o teu histórico de revisão personalizado!",
            `Com base nos teus interesses em ${profile.interests.slice(0, 2).join(" e ")}, podes começar por fazer perguntas sobre esses assuntos.`,
          ],
          hasData: false,
        };
      }

      // Get learning progress
      const dbConn = await db.getDb();
      let progressData: Array<{
        subject: string;
        topic: string;
        masteryLevel: number | null;
        practiceCount: number | null;
      }> = [];

      if (dbConn) {
        const { learningProgress } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");

        progressData = await dbConn
          .select()
          .from(learningProgress)
          .where(eq(learningProgress.profileId, profile.id))
          .orderBy(desc(learningProgress.lastReviewedAt))
          .limit(20);
      }

      // Build context for Claude
      const subjectsStudied = new Set(
        conversations.filter(c => c.subject).map(c => c.subject)
      );

      const userContext = `
PERFIL: ${profile.fullName}, ${profile.age} anos, ${profile.grade}
INTERESSES: ${profile.interests.join(", ")}
CONVERSAS: ${conversations.length}
ASSUNTOS: ${Array.from(subjectsStudied).join(", ") || "Variados"}
PROGRESSO: ${progressData.slice(0, 5).map(p => `${p.subject}: ${p.topic} (${p.masteryLevel || 0}%)`).join(", ")}
      `.trim();

      try {
        const suggestionResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Gera 4-6 sugestões PRÁTICAS de revisão em português de Moçambique baseadas no histórico do estudante. Retorna APENAS JSON array: ["sugestão 1", "sugestão 2", ...]`,
            },
            {
              role: "user",
              content: userContext,
            },
          ],
        });

        const suggestionContent = suggestionResponse.choices[0].message.content;
        let suggestions: string[] = [];

        if (typeof suggestionContent === "string") {
          try {
            const parsed = JSON.parse(suggestionContent);
            suggestions = Array.isArray(parsed) ? parsed : [suggestionContent];
          } catch {
            suggestions = suggestionContent.split("\n").filter(line => line.trim().length > 0);
          }
        }

        return {
          suggestions: suggestions.slice(0, 6),
          hasData: true,
        };
      } catch (error) {
        console.error("Failed to generate review suggestions:", error);
        
        const fallbackSuggestions = [
          `Revê os tópicos de ${Array.from(subjectsStudied)[0] || "Matemática"} que já estudaste.`,
          `Pratica mais sobre ${profile.interests[0]} para conectar com os teus interesses.`,
        ];

        return {
          suggestions: fallbackSuggestions,
          hasData: true,
        };
      }
    }),

    // Start a review session for a specific topic
    startReviewSession: protectedProcedure
      .input(
        z.object({
          subject: z.string(),
          topic: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new Error("Profile not found");
        }

        // Create a new conversation in revision mode
        const conversation = await db.createConversation({
          userId: ctx.user.id,
          profileId: profile.id,
          mode: "revision",
          subject: input.subject,
          topic: input.topic,
        });

        // Update learning progress
        await db.updateLearningProgress({
          profileId: profile.id,
          subject: input.subject,
          topic: input.topic,
        });

        return {
          conversationId: conversation.id,
        };
      }),
  }),

  // Conversations
  conversations: router({
    // Create a new conversation
    create: protectedProcedure
      .input(
        z.object({
          mode: z.enum(["quick_doubt", "exam_prep", "revision", "free_learning"]),
          subject: z.string().optional(),
          topic: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new Error("Profile not found. Please complete onboarding first.");
        }

        const conversation = await db.createConversation({
          userId: ctx.user.id,
          profileId: profile.id,
          mode: input.mode,
          subject: input.subject,
          topic: input.topic,
        });

        return conversation;
      }),

    // Get a specific conversation with messages
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const conversation = await db.getConversationById(input.id);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Conversation not found");
        }

        const messages = await db.getMessagesByConversationId(input.id);
        
        return {
          conversation,
          messages,
        };
      }),

    // Delete a conversation
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getConversationById(input.id);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Conversation not found");
        }

        await db.deleteConversation(input.id, ctx.user.id);
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Helper functions
function checkModeAccess(plan: string, mode: string): boolean {
  if (plan === "free") {
    return mode === "quick_doubt";
  }
  if (plan === "student") {
    return mode === "quick_doubt" || mode === "exam_prep";
  }
  // student_plus and family have access to all modes
  return true;
}

function buildSystemPrompt(profile: any): string {
  const interests = profile.interests.join(", ");
  const otherInterests = profile.otherInterests ? ` (outros: ${profile.otherInterests})` : "";
  const learningPrefs = profile.learningPreferences?.length > 0 
    ? `\n- Prefere aprender: ${profile.learningPreferences.join(", ")}` 
    : "";
  const challenges = profile.challenges 
    ? `\n- Dificuldades: ${profile.challenges}` 
    : "";
  const goals = profile.studyGoals 
    ? `\n- Objetivos: ${profile.studyGoals}` 
    : "";

  return `És o Genius, um professor virtual moçambicano especializado em ensinar estudantes de forma personalizada.

INFORMAÇÃO DO ESTUDANTE:
- Nome: ${profile.fullName}
- Idade: ${profile.age} anos
- Classe/Nível: ${profile.grade}
- Interesses: ${interests}${otherInterests}${learningPrefs}${challenges}${goals}
- Escola: ${profile.schoolName} (${profile.city}, ${profile.province})

PRINCÍPIOS FUNDAMENTAIS:
1. NUNCA dês a resposta final diretamente. O teu papel é ENSINAR, não responder.
2. Usa o método socrático: faz perguntas que guiem o estudante até à solução.
3. Adapta os exemplos aos interesses do estudante (${interests}${otherInterests}).
4. Usa contexto moçambicano sempre que possível (moeda MZN, locais conhecidos, etc).
5. Usa português de Moçambique ou Portugal, NUNCA brasileiro.
6. USA CONHECIMENTO GLOBAL DE PONTA - não te limites aos manuais escolares moçambicanos.
7. Ensina com as melhores explicações, métodos e exemplos disponíveis mundialmente.
8. Adapta esse conhecimento global ao contexto moçambicano (exemplos, moeda, realidade local).
9. O objectivo é formar moçambicanos INTELIGENTES e COMPETITIVOS GLOBALMENTE.
10. Prepara estudantes para passar nos exames locais MAS também para competir internacionalmente.

METODOLOGIA (5 PASSOS):
1. COMPREENDER: Faz perguntas para entender completamente a dúvida
2. ENSINAR: Explica o conceito de forma clara e adaptada à idade do estudante
   - USA as MELHORES explicações e métodos disponíveis (não te limites aos manuais)
   - Adiciona contexto histórico, aplicações modernas, curiosidades científicas
   - Mostra como o conceito é usado no mundo real e em tecnologia moderna
3. DEMONSTRAR: Mostra um exemplo prático relacionado aos interesses do estudante
   - Usa contexto moçambicano (meticais, cidades, situações locais)
   - Mas com qualidade e profundidade de exemplos internacionais
4. VERIFICAR: Pergunta "Entendeste?" e espera confirmação antes de avançar
5. TESTAR: Propõe 2 exercícios simples para confirmar a compreensão

EXEMPLOS PERSONALIZADOS:
- Se o estudante gosta de futebol, usa exemplos com jogadores moçambicanos/internacionais, golos, estatísticas
- Se gosta de música, usa exemplos com artistas moçambicanos, ritmos, notas, instrumentos
- Se gosta de culinária, usa exemplos com pratos moçambicanos, receitas, quantidades, proporções
- Adapta sempre aos interesses específicos do estudante
- USA SEMPRE contexto moçambicano (locais, moeda MZN, situações reais) MAS com conhecimento global

CONHECIMENTO E QUALIDADE:
- Prefere SEMPRE a melhor explicação disponível, mesmo que não esteja nos manuais escolares
- Se os manuais moçambicanos têm métodos desatualizados ou limitados, ensina métodos melhores
- Adiciona conhecimento científico moderno, descobertas recentes, aplicações tecnológicas
- Explica conceitos com profundidade adequada à idade, mas sem limitar o potencial do estudante
- Se o estudante perguntar "como está no manual?", podes consultar, mas sempre adiciona mais valor
- Para preparação de exames UEM/UP, conhece o formato mas ensina além do necessário para passar

QUANDO O ESTUDANTE TEM DIFICULDADES:
- Se o estudante não conseguir responder após 2-3 tentativas, dá DICAS mais diretas
- Se ainda assim não conseguir, MOSTRA a resposta mas EXPLICA o raciocínio passo a passo
- Depois de mostrar a resposta, propõe um exercício similar para garantir que aprendeu
- COMPROMETE-TE a garantir que o estudante dominou o conceito antes de avançar
- Nunca deixes o estudante frustrado - ajusta o nível de dificuldade conforme necessário

LINGUAGEM:
- Usa "tu" e "teu/tua" (não uses "você")
- Sê amigável mas profissional
- Celebra os sucessos do estudante
- Encoraja quando houver dificuldades
- Mostra empatia e paciência

FORMATAÇÃO DO TEXTO:
- USA MARKDOWN para formatar as respostas
- Para destacar palavras importantes: **palavra** (bold)
- Para ênfase suave: *palavra* (itálico)
- Para listas: usa - ou 1. 2. 3.
- Para fórmulas matemáticas simples: usa notação clara (ex: x² + 2x + 1)
- NUNCA uses asteriscos soltos no texto (tipo *isto*) - sempre usa Markdown correto
- Mantém o texto limpo e bem formatado

Lembra-te: O objectivo não é dar respostas, mas desenvolver o pensamento crítico e a autonomia do estudante. MAS, se o estudante tiver dificuldades persistentes, ajuda-o com a resposta e garante que ele aprendeu o processo!`;
}

