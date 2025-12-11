import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  BookOpen, 
  Search, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  Lightbulb,
  Target,
  Calendar,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

export default function Revision() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch real review topics from backend
  const reviewTopicsQuery = trpc.revision.getReviewTopics.useQuery({ limit: 20 });
  
  // Fetch smart suggestions from Claude
  const smartSuggestionsQuery = trpc.revision.getSmartSuggestions.useQuery();
  
  // Start review session mutation
  const startReviewMutation = trpc.revision.startReviewSession.useMutation({
    onSuccess: (data) => {
      toast.success("Sessão de revisão iniciada!");
      setLocation("/chat");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (reviewTopicsQuery.data) {
      console.log("📚 Revision - Topics:", reviewTopicsQuery.data);
    }
  }, [reviewTopicsQuery.data]);

  const topics = reviewTopicsQuery.data?.topics || [];
  const hasConversations = reviewTopicsQuery.data?.hasConversations || false;

  const filteredTopics = topics.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMasteryColor = (level: number) => {
    if (level >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (level >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getLastReviewedText = (lastReviewedAt: Date | null, daysSinceReview: number) => {
    if (!lastReviewedAt) return "Nunca";
    if (daysSinceReview === 0) return "Hoje";
    if (daysSinceReview === 1) return "Ontem";
    if (daysSinceReview < 7) return `Há ${daysSinceReview} dias`;
    if (daysSinceReview < 30) return `Há ${Math.floor(daysSinceReview / 7)} semanas`;
    return `Há ${Math.floor(daysSinceReview / 30)} meses`;
  };

  const handleStartReview = (subject: string, topic: string) => {
    startReviewMutation.mutate({ subject, topic });
  };

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
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
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
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">Revisão Inteligente</h1>
              <p className="text-muted-foreground text-lg">
                {hasConversations 
                  ? "Revê e domina os tópicos que já estudaste" 
                  : "Começa a estudar para gerares o teu histórico de revisão"}
              </p>
            </div>
            {reviewTopicsQuery.data?.totalTopics && (
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {reviewTopicsQuery.data.totalTopics}
                </div>
                <div className="text-sm text-muted-foreground">
                  tópicos para rever
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Smart Suggestions from Claude */}
        {smartSuggestionsQuery.data?.suggestions && smartSuggestionsQuery.data.suggestions.length > 0 && (
          <Card className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-purple-900">
                  Sugestões Personalizadas de Revisão
                </h2>
                <p className="text-sm text-purple-700">
                  Baseado no teu perfil e histórico de estudo
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {smartSuggestionsQuery.data.suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="p-4 bg-white/80 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Search */}
        {hasConversations && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Procura por matéria ou tópico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {reviewTopicsQuery.isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">A carregar tópicos de revisão...</p>
          </div>
        )}

        {/* No Conversations Yet */}
        {!reviewTopicsQuery.isLoading && !hasConversations && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {reviewTopicsQuery.data?.message || "Ainda não tens conversas"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              A revisão funciona melhor quando já tens um histórico de estudo. 
              Começa a estudar para poderes rever depois com base no teu progresso real!
            </p>
            <Button 
              onClick={() => setLocation("/chat")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Começar a Estudar Agora
            </Button>
          </div>
        )}

        {/* Topics Grid */}
        {hasConversations && filteredTopics.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTopics.map((topic, index) => (
              <Card
                key={`${topic.subject}-${topic.topic}-${index}`}
                className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => handleStartReview(topic.subject, topic.topic)}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{topic.subject}</h3>
                    <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getMasteryColor(topic.masteryLevel)}`}>
                      {topic.masteryLevel}%
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{topic.topic}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Última revisão: {getLastReviewedText(topic.lastReviewedAt, topic.daysSinceReview)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Próxima revisão: {topic.nextReview}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span>Práticas: {topic.practiceCount}</span>
                  </div>
                  {topic.accuracy > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Precisão: {topic.accuracy}%</span>
                    </div>
                  )}
                </div>

                {(topic.nextReview === "Hoje" || topic.masteryLevel < 70) && (
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartReview(topic.subject, topic.topic);
                      }}
                      disabled={startReviewMutation.isPending}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {topic.masteryLevel < 70 ? "Praticar Mais" : "Rever Agora"}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {hasConversations && filteredTopics.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum tópico encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tenta procurar por outro termo ou começa a estudar este assunto
            </p>
            <Button onClick={() => setSearchTerm("")} variant="outline">
              Limpar pesquisa
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
