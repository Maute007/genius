import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO } from "@/const";
import { 
  GraduationCap, 
  Search, 
  Calendar,
  Clock,
  BookMarked,
  ArrowLeft,
  Target,
  Zap
} from "lucide-react";

export default function ExamPrep() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Exames mockados (você pode integrar com backend depois)
  const upcomingExams = [
    {
      id: 1,
      subject: "Matemática",
      examName: "Teste Trimestral",
      date: "2024-02-15",
      daysUntil: 5,
      topics: ["Equações", "Funções", "Geometria"],
      preparedness: 75,
    },
    {
      id: 2,
      subject: "Física",
      examName: "Exame Final",
      date: "2024-02-20",
      daysUntil: 10,
      topics: ["Mecânica", "Termodinâmica", "Ondas"],
      preparedness: 60,
    },
    {
      id: 3,
      subject: "Química",
      examName: "Mini-Teste",
      date: "2024-02-12",
      daysUntil: 2,
      topics: ["Reações", "Estequiometria"],
      preparedness: 85,
    },
  ];

  const filteredExams = upcomingExams.filter(
    (exam) =>
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.examName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 3) return "bg-red-50 border-red-200";
    if (daysUntil <= 7) return "bg-yellow-50 border-yellow-200";
    return "bg-blue-50 border-blue-200";
  };

  const getUrgencyBadge = (daysUntil: number) => {
    if (daysUntil <= 3) return <Badge variant="destructive">Urgente</Badge>;
    if (daysUntil <= 7) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Em breve</Badge>;
    return <Badge variant="secondary">Planeado</Badge>;
  };

  const getPreparednessColor = (level: number) => {
    if (level >= 80) return "text-green-600";
    if (level >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
            <div className="p-3 bg-purple-50 rounded-lg">
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Preparação para Exames</h1>
              <p className="text-muted-foreground text-lg">
                Prepara-te para os teus exames com confiança
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Procura por matéria ou exame..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exames Urgentes</p>
                <p className="text-2xl font-bold">
                  {upcomingExams.filter(e => e.daysUntil <= 3).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Exames</p>
                <p className="text-2xl font-bold">{upcomingExams.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preparação Média</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    upcomingExams.reduce((acc, e) => acc + e.preparedness, 0) /
                      upcomingExams.length
                  )}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Exams List */}
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <Card
              key={exam.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${getUrgencyColor(exam.daysUntil)}`}
              onClick={() => setLocation("/chat")}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{exam.subject}</h3>
                    {getUrgencyBadge(exam.daysUntil)}
                  </div>
                  <p className="text-lg text-muted-foreground">{exam.examName}</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getPreparednessColor(exam.preparedness)}`}>
                    {exam.preparedness}%
                  </div>
                  <p className="text-sm text-muted-foreground">Preparação</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(exam.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {exam.daysUntil === 1
                      ? "Amanhã"
                      : exam.daysUntil === 0
                      ? "Hoje"
                      : `Daqui a ${exam.daysUntil} dias`}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookMarked className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tópicos a estudar:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {exam.topics.map((topic, idx) => (
                    <Badge key={idx} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <Button className="flex-1" variant="outline">
                  Criar Plano de Estudo
                </Button>
                <Button className="flex-1">
                  Estudar Agora
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-16">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum exame encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tenta procurar por outro termo"
                : "Adiciona os teus exames para começares a preparar-te"}
            </p>
            <Button onClick={() => setLocation("/chat")}>
              Adicionar Exame
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
