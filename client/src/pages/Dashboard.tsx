import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, Conversation } from "@/lib/api";
import { APP_LOGO } from "@/const";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { 
  MessageSquare, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  Zap,
  User,
  MessageCircle,
  Calendar,
  Loader2
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useGeniusAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const convs = await api.conversations.list();
        setConversations(convs);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const quickActions = [
    {
      title: "Começar a Estudar",
      description: "Abre o chat e faz uma pergunta",
      icon: MessageSquare,
      color: "bg-teal-50 text-teal-600",
      action: () => setLocation("/chat"),
    },
    {
      title: "Revisão",
      description: "Revê tópicos estudados",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      action: () => setLocation("/chat"),
    },
    {
      title: "Preparação Exame",
      description: "Prepara-te para exames",
      icon: Target,
      color: "bg-purple-50 text-purple-600",
      action: () => setLocation("/chat"),
    },
  ];

  const stats = [
    {
      label: "Total de conversas",
      value: conversations.length.toString(),
      icon: MessageSquare,
    },
    {
      label: "Modo mais usado",
      value: conversations.length > 0 
        ? getMostUsedMode(conversations) 
        : "N/A",
      icon: Zap,
    },
    {
      label: "Última atividade",
      value: conversations.length > 0 
        ? new Date(conversations[0]?.updatedAt).toLocaleDateString("pt-MZ") 
        : "N/A",
      icon: Clock,
    },
  ];

  function getMostUsedMode(convs: Conversation[]): string {
    const modeLabels: Record<string, string> = {
      quick_doubt: "Dúvida Rápida",
      exam_prep: "Preparação",
      revision: "Revisão",
      free_learning: "Livre"
    };
    const counts: Record<string, number> = {};
    convs.forEach(c => {
      counts[c.mode] = (counts[c.mode] || 0) + 1;
    });
    const maxMode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return maxMode ? modeLabels[maxMode[0]] || maxMode[0] : "N/A";
  }

  const recentConversations = conversations.slice(0, 5).map((conv) => {
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
    };
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
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

      <div className="container py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Olá, {user?.name || "Estudante"}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Bem-vindo de volta ao Genius. Pronto para dominar mais conhecimento hoje?
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="p-6 transition-all cursor-pointer hover:shadow-lg hover:scale-105"
              onClick={action.action}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <action.icon className="h-6 w-6" />
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

        <div className="grid gap-6 lg:grid-cols-2">
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

            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-bold mb-4">Teu Perfil</h3>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-semibold">{user?.name || "Estudante"}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="h-5 w-5 text-teal-600" />
              <h2 className="text-xl font-bold">Histórico de Conversas</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Continua de onde paraste ou revê o que já estudaste
            </p>
            {recentConversations.length === 0 ? (
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
                    </div>
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
