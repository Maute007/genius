import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { APP_LOGO } from "@/const";
import { PlanBadge } from "@/components/PlanBadge";
import { PlanFeatures } from "@/components/PlanFeatures";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { 
  MessageSquare, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  Zap,
  User,
  Lock,
  Shield,
  Lightbulb,
  MessageCircle,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [userName, setUserName] = useState("Estudante");
  const { user } = useGeniusAuth();

  // Buscar perfil do usuário
  const profileQuery = trpc.profile.get.useQuery();
  
  // Buscar status da subscription
  const subscriptionQuery = trpc.subscription.getStatus.useQuery();
  
  // Buscar estatísticas reais do backend
  const statsQuery = trpc.dashboard.stats.useQuery();
  
  // Buscar conversas recentes
  const conversationsQuery = trpc.dashboard.recentConversations.useQuery({ limit: 5 });

  // Buscar insights personalizados
  const insightsQuery = trpc.dashboard.personalizedInsights.useQuery();

  // Debug: log conversations data
  useEffect(() => {
    if (conversationsQuery.data) {
      console.log("🔍 Dashboard - Conversas recebidas:", conversationsQuery.data);
    }
  }, [conversationsQuery.data]);

  // Debug: log insights data
  useEffect(() => {
    if (insightsQuery.data) {
      console.log("💡 Dashboard - Insights recebidos:", insightsQuery.data);
    }
  }, [insightsQuery.data]);

  // Tópicos de revisão recomendados do backend
  const reviewTopicsQuery = trpc.dashboard.reviewTopics.useQuery({ limit: 6 });
  const reviewTopics = reviewTopicsQuery.data?.map((t) => ({
    subject: t.subject,
    topic: t.topic,
    masteryLevel: t.masteryLevel ?? 0,
    lastReviewed: t.lastReviewedAt
      ? new Date(t.lastReviewedAt).toLocaleDateString("pt-MZ")
      : "—",
  })) || [];

  useEffect(() => {
    if (profileQuery.data) {
      setUserName(profileQuery.data.fullName || "Estudante");
    }
  }, [profileQuery.data]);

  const userPlan = subscriptionQuery.data?.plan || "free";
  const questionsUsed = subscriptionQuery.data?.questionsUsed || 0;
  const questionsLimit = subscriptionQuery.data?.questionsLimit || null;

  // Verificar se modo está disponível no plano
  const isModeAvailable = (mode: string) => {
    if (userPlan === "free") return mode === "quick_doubt";
    if (userPlan === "student") return mode !== "free_learning";
    return true; // student_plus e family tem tudo
  };

  // Cards de ação rápida
  const quickActions = [
    {
      title: "Começar a Estudar",
      description: "Abre o chat e faz uma pergunta",
      icon: MessageSquare,
      color: "bg-teal-50 text-teal-600",
      action: () => setLocation("/chat"),
      available: true,
    },
    {
      title: "Revisão",
      description: "Revê tópicos estudados",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      action: () => setLocation("/revision"),
      available: isModeAvailable("revision"),
    },
    {
      title: "Preparação Exame",
      description: "Prepara-te para exames",
      icon: Target,
      color: "bg-purple-50 text-purple-600",
      action: () => setLocation("/exam-prep"),
      available: isModeAvailable("exam_prep"),
    },
  ];

  // Estatísticas reais do backend
  const stats = [
    {
      label: "Perguntas este mês",
      value: statsQuery.data?.questionsThisMonth?.toString() || "0",
      icon: Zap,
    },
    {
      label: "Tempo de estudo",
      value: statsQuery.data?.studyTimeMinutes 
        ? `${statsQuery.data.studyTimeMinutes}m` 
        : "0m",
      icon: Clock,
    },
    {
      label: "Progresso",
      value: statsQuery.data?.progress?.toString() || "0",
      icon: TrendingUp,
    },
  ];

  // Conversas recentes reais do backend com informações enriquecidas
  const recentConversations = conversationsQuery.data?.map((conv) => {
    const modeLabels: Record<string, string> = {
      quick_doubt: "Dúvida Rápida",
      exam_prep: "Preparação para Exame",
      revision: "Revisão",
      free_learning: "Aprendizagem Livre"
    };

    return {
      id: conv.id,
      title: conv.title || "Conversa sem título",
      mode: modeLabels[conv.mode] || conv.mode,
      subject: conv.subject || null,
      topic: conv.topic || null,
      date: new Date(conv.createdAt).toLocaleDateString("pt-MZ"),
      messageCount: conv.messageCount || 0,
      userMessageCount: conv.userMessageCount || 0,
      lastMessagePreview: conv.lastMessagePreview || "",
      hasMessages: conv.hasMessages || false,
    };
  }) || [];

  // Debug: log processed conversations
  useEffect(() => {
    console.log("📊 Dashboard - Total conversas:", recentConversations.length);
    console.log("📊 Dashboard - Conversas processadas:", recentConversations);
  }, [recentConversations.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={APP_LOGO} 
              alt="Genius" 
              className="h-10 w-auto cursor-pointer transition-transform hover:scale-105"
              onClick={() => setLocation("/")}
            />
            <span className="text-xl font-bold">Genius</span>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === "super_admin" && (
              <Button 
                variant="outline" 
                onClick={() => setLocation("/admin")}
                className="border-purple-200 hover:bg-purple-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" onClick={() => setLocation("/")}>
              Início
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/planos")}>
              Planos
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/contactos")}>
              Contactos
            </Button>
            <Button 
              className="bg-teal-500 hover:bg-teal-600"
              onClick={() => setLocation("/chat")}
            >
              Abrir Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Greeting with Plan Badge */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Olá, {userName}! 👋
              <PlanBadge plan={userPlan} />
            </h1>
            <p className="text-muted-foreground text-lg">
              Bem-vindo de volta ao Genius. Pronto para dominar mais conhecimento hoje?
            </p>
          </div>
        </div>

        {/* Personalized Insights */}
        {insightsQuery.data?.insights && insightsQuery.data.insights.length > 0 && (
          <Card className="mb-8 p-6 bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-teal-900">
                  Insights Personalizados para Ti
                </h2>
                <p className="text-sm text-teal-700">
                  Baseado no teu perfil e atividade recente
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {insightsQuery.data.insights.map((insight, index) => (
                <div 
                  key={index}
                  className="p-4 bg-white/80 rounded-lg border border-teal-100 hover:border-teal-300 transition-colors"
                >
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
            {insightsQuery.data.profileSummary && (
              <div className="mt-4 pt-4 border-t border-teal-200 flex flex-wrap gap-4 text-xs text-teal-700">
                <span>📊 {insightsQuery.data.profileSummary.totalConversations} conversas</span>
                {insightsQuery.data.profileSummary.subjectsStudied.length > 0 && (
                  <span>📚 {insightsQuery.data.profileSummary.subjectsStudied.length} assuntos</span>
                )}
                <span>✨ {insightsQuery.data.profileSummary.progressItems} tópicos praticados</span>
              </div>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className={`p-6 transition-all ${
                action.available
                  ? "cursor-pointer hover:shadow-lg hover:scale-105"
                  : "opacity-60 cursor-not-allowed"
              }`}
              onClick={() => {
                if (action.available) {
                  action.action();
                } else {
                  toast.error("Recurso bloqueado", {
                    description: "Faça upgrade do seu plano para desbloquear este recurso.",
                  });
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${action.color} relative`}>
                  <action.icon className="h-6 w-6" />
                  {!action.available && (
                    <div className="absolute -top-1 -right-1 bg-gray-900 rounded-full p-1">
                      <Lock className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recommended Review Topics and Plan Features */}
        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          {/* Recommended Review Topics */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-2">Revisão Recomendada</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Baseado no teu progresso e preferências do onboarding
            </p>
            {reviewTopicsQuery.isLoading ? (
              <div className="text-center py-8 text-muted-foreground">A carregar...</div>
            ) : reviewTopics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">Ainda não tens tópicos registados.</p>
                <Button onClick={() => setLocation("/revision")}>
                  Ir para Revisão
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {reviewTopics.map((t, idx) => (
                  <div
                    key={`${t.subject}-${t.topic}-${idx}`}
                    className="p-4 rounded-lg border hover:bg-muted/30 cursor-pointer"
                    onClick={() => setLocation(`/revision`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{t.subject}</p>
                        <p className="text-sm text-muted-foreground">{t.topic}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">Última: {t.lastReviewed}</span>
                        <div className="text-sm">Domínio: {t.masteryLevel}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Plan Features Card */}
          <PlanFeatures
            plan={userPlan}
            questionsUsed={questionsUsed}
            questionsLimit={questionsLimit}
          />
        </div>

        {/* Statistics and Recent Conversations */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Statistics */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Estatísticas</h2>
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* User Profile */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-bold mb-4">Teu Perfil</h3>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Classe</p>
                  <p className="font-semibold">
                    {profileQuery.data?.grade || "12"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Conversations */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="h-5 w-5 text-teal-600" />
              <h2 className="text-xl font-bold">Histórico de Conversas</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Continua de onde paraste ou revê o que já estudaste
            </p>
            {conversationsQuery.isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                A carregar...
              </div>
            ) : recentConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">Ainda não tens conversas.</p>
                <Button onClick={() => setLocation("/chat")}>
                  Começar agora
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-all hover:shadow-md"
                    onClick={() => setLocation("/chat")}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1">
                          {conversation.title}
                        </h4>
                        {(conversation.subject || conversation.topic) && (
                          <p className="text-xs text-teal-600 mb-1">
                            {conversation.subject && `${conversation.subject}`}
                            {conversation.topic && ` • ${conversation.topic}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {conversation.date}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-muted rounded-full">
                        {conversation.mode}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {conversation.userMessageCount} perguntas
                        </span>
                        {conversation.messageCount > 0 && (
                          <span>{conversation.messageCount} msgs</span>
                        )}
                      </div>
                    </div>

                    {conversation.lastMessagePreview && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                        "{conversation.lastMessagePreview}..."
                      </p>
                    )}
                  </div>
                ))}
                
                {recentConversations.length >= 5 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setLocation("/chat")}
                  >
                    Ver todas as conversas
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
