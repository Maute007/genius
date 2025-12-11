import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { ArrowUpRight, Lock, Check } from "lucide-react";

interface PlanFeaturesProps {
  plan: "free" | "student" | "student_plus" | "family";
  questionsUsed: number;
  questionsLimit: number | null;
}

const PLAN_FEATURES = {
  free: {
    name: "Gratuito",
    features: [
      { text: "100 perguntas por mês", available: true },
      { text: "Modo Dúvida Rápida", available: true },
      { text: "Preparação para Exames", available: false },
      { text: "Revisão de Conteúdo", available: false },
      { text: "Aprendizagem Livre", available: false },
      { text: "Histórico completo", available: false },
    ],
    limit: 100,
  },
  student: {
    name: "Estudante",
    features: [
      { text: "Perguntas ilimitadas", available: true },
      { text: "Modo Dúvida Rápida", available: true },
      { text: "Preparação para Exames", available: true },
      { text: "Revisão de Conteúdo", available: true },
      { text: "Aprendizagem Livre", available: false },
      { text: "Histórico completo", available: true },
    ],
    limit: null,
  },
  student_plus: {
    name: "Estudante+",
    features: [
      { text: "Perguntas ilimitadas", available: true },
      { text: "Modo Dúvida Rápida", available: true },
      { text: "Preparação para Exames", available: true },
      { text: "Revisão de Conteúdo", available: true },
      { text: "Aprendizagem Livre", available: true },
      { text: "Histórico completo", available: true },
      { text: "Prioridade no suporte", available: true },
    ],
    limit: null,
  },
  family: {
    name: "Família",
    features: [
      { text: "Perguntas ilimitadas", available: true },
      { text: "Todos os modos disponíveis", available: true },
      { text: "Até 4 contas", available: true },
      { text: "Histórico completo", available: true },
      { text: "Prioridade no suporte", available: true },
      { text: "Relatórios de progresso", available: true },
    ],
    limit: null,
  },
};

export function PlanFeatures({ plan, questionsUsed, questionsLimit }: PlanFeaturesProps) {
  const [, setLocation] = useLocation();
  const config = PLAN_FEATURES[plan];
  const showUpgrade = plan === "free" || plan === "student";

  const usagePercentage = questionsLimit
    ? Math.min((questionsUsed / questionsLimit) * 100, 100)
    : 0;

  const isNearLimit = questionsLimit && questionsUsed >= questionsLimit * 0.8;
  const isAtLimit = questionsLimit && questionsUsed >= questionsLimit;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Plano: {config.name}</CardTitle>
        <CardDescription>
          {questionsLimit
            ? "Acompanhe o uso do seu plano"
            : "Aproveite recursos ilimitados"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Progress */}
        {questionsLimit && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Perguntas este mês</span>
              <span
                className={
                  isAtLimit
                    ? "text-red-600 font-semibold"
                    : isNearLimit
                    ? "text-orange-600 font-semibold"
                    : "text-muted-foreground"
                }
              >
                {questionsUsed} / {questionsLimit}
              </span>
            </div>
            <Progress
              value={usagePercentage}
              className={`h-2 ${
                isAtLimit
                  ? "[&>div]:bg-red-500"
                  : isNearLimit
                  ? "[&>div]:bg-orange-500"
                  : "[&>div]:bg-teal-500"
              }`}
            />
            {isNearLimit && !isAtLimit && (
              <p className="text-xs text-orange-600">
                ⚠️ Você está próximo do limite mensal
              </p>
            )}
            {isAtLimit && (
              <p className="text-xs text-red-600 font-medium">
                🚫 Limite mensal atingido. Faça upgrade para continuar!
              </p>
            )}
          </div>
        )}

        {/* Features List */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Recursos disponíveis:</p>
          <ul className="space-y-2">
            {config.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {feature.available ? (
                  <Check className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                )}
                <span className={feature.available ? "" : "text-muted-foreground"}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade Button */}
        {showUpgrade && (
          <div className="pt-4 border-t">
            <Button
              onClick={() => setLocation("/planos")}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
            >
              Fazer Upgrade
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Desbloqueie mais recursos e perguntas ilimitadas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
