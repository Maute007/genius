import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_LOGO } from "@/const";
import { BookOpen, Search, ArrowLeft, Target } from "lucide-react";

const SAMPLE_TOPICS = [
  { subject: "Matemática", topic: "Equações do 2º Grau", mastery: 75 },
  { subject: "Física", topic: "Leis de Newton", mastery: 60 },
  { subject: "Química", topic: "Tabela Periódica", mastery: 85 },
  { subject: "Biologia", topic: "Célula Animal", mastery: 45 },
  { subject: "Português", topic: "Análise Sintática", mastery: 70 },
];

export default function Revision() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTopics = SAMPLE_TOPICS.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMasteryColor = (level: number) => {
    if (level >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (level >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const handleStartReview = (subject: string, topic: string) => {
    setLocation("/chat");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={APP_LOGO} 
              alt="Genius" 
              className="h-10 w-auto cursor-pointer"
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

      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Revisão Inteligente</h1>
              <p className="text-muted-foreground text-lg">
                Revê e domina os tópicos que já estudaste
              </p>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Pesquisar tópicos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic, index) => (
            <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">{topic.subject}</p>
                  <h3 className="font-semibold">{topic.topic}</h3>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium border ${getMasteryColor(topic.mastery)}`}>
                  {topic.mastery}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${topic.mastery}%` }}
                />
              </div>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => handleStartReview(topic.subject, topic.topic)}
              >
                <Target className="mr-2 h-4 w-4" />
                Iniciar Revisão
              </Button>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum tópico encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
