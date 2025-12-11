import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    period: "",
    subtitle: "Experimenta o Genius",
    features: [
      { text: "100 perguntas por mês", included: true },
      { text: "Modo Dúvida Rápida", included: true },
      { text: "Personalização básica", included: true },
      { text: "Preparação para Exames", included: false },
      { text: "Modo Revisão", included: false },
      { text: "Aprendizagem Livre", included: false },
      { text: "Dashboard de Progresso", included: false },
    ],
    cta: "Plano Atual",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    id: "student",
    name: "Estudante",
    price: 500,
    period: "/por mês",
    subtitle: "Para estudantes dedicados",
    features: [
      { text: "Perguntas ilimitadas", included: true },
      { text: "Modo Dúvida Rápida", included: true },
      { text: "Preparação para Exames", included: true },
      { text: "Personalização completa", included: true },
      { text: "Modo Revisão", included: false },
      { text: "Aprendizagem Livre", included: false },
      { text: "Dashboard de Progresso", included: true },
    ],
    cta: "Escolher Plano",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    id: "student_plus",
    name: "Estudante+",
    price: 1000,
    period: "/por mês",
    subtitle: "Experiência completa",
    features: [
      { text: "Perguntas ilimitadas", included: true },
      { text: "Todos os 4 modos de estudo", included: true },
      { text: "Modo Dúvida Rápida", included: true },
      { text: "Preparação para Exames", included: true },
      { text: "Modo Revisão", included: true },
      { text: "Aprendizagem Livre", included: true },
      { text: "Dashboard avançado", included: true },
      { text: "Analytics detalhados", included: true },
    ],
    cta: "Escolher Plano",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    id: "family",
    name: "Família",
    price: 2000,
    period: "/por mês",
    subtitle: "Para 2 estudantes",
    features: [
      { text: "2 estudantes incluídos", included: true },
      { text: "Todos os 4 modos de estudo", included: true },
      { text: "Perguntas ilimitadas", included: true },
      { text: "Dashboard para Pais", included: true },
      { text: "Relatórios semanais", included: true },
      { text: "Alertas por email/SMS", included: true },
      { text: "Controlo parental", included: true },
      { text: "Economia de 1.000 MZN", included: true },
    ],
    cta: "Escolher Plano",
    ctaVariant: "outline" as const,
    popular: false,
  },
];

export default function Planos() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useGeniusAuth();

  const handleSelectPlan = (planId: string, planName: string) => {
    if (!isAuthenticated) {
      toast.info("Por favor, faz login primeiro");
      setLocation("/login");
      return;
    }

    if (planId === "free") {
      setLocation("/chat");
      return;
    }

    // Redirect to checkout page with plan ID
    setLocation(`/checkout?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/50 backdrop-blur">
        <div className="container flex h-28 items-center justify-between">
          <img 
            src={APP_LOGO} 
            alt="Genius" 
            className="h-24 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
            onClick={() => setLocation("/")}
          />
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Escolhe o teu plano</h1>
          <p className="text-lg text-muted-foreground">
            Todos os planos incluem personalização completa e contexto moçambicano
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pagamento via M-Pesa, E-Mola ou Mkesh
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? "border-primary shadow-lg shadow-primary/20" : "border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold text-white">
                    Mais Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.subtitle}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "Grátis" : `${plan.price} MZN`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 shrink-0 text-primary" />
                      ) : (
                        <X className="h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id, plan.name)}
                  variant={plan.ctaVariant}
                  className={`w-full ${plan.popular ? 'bg-teal-500 hover:bg-teal-600 text-white' : ''}`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* School Plans */}
        <div className="mx-auto mt-16 max-w-4xl">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Planos para Escolas</CardTitle>
              <CardDescription>
                Soluções personalizadas para instituições de ensino
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-muted-foreground">
                Oferecemos planos especiais para escolas, universidades e institutos técnicos.
              </p>
              <p className="mb-6 text-lg font-semibold text-gray-900">
                Contacta-nos para uma proposta personalizada adaptada às necessidades da tua instituição.
              </p>
              <p className="mb-6 text-sm text-muted-foreground">
                Inclui dashboard para professores, relatórios institucionais e suporte dedicado
              </p>
              <Button size="lg" onClick={() => setLocation("/escolas")}>
                Saber Mais
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "Como funciona o pagamento?",
                a: "Aceitamos M-Pesa, E-Mola e Mkesh. O pagamento é mensal e renovado automaticamente.",
              },
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim! Podes cancelar a tua subscrição a qualquer momento sem custos adicionais.",
              },
              {
                q: "O que acontece se atingir o limite do plano gratuito?",
                a: "Podes fazer upgrade a qualquer momento para continuar a aprender sem limites.",
              },
              {
                q: "O plano Família funciona para quantos estudantes?",
                a: "O plano Família inclui 2 estudantes. Para mais estudantes, contacta-nos para um plano personalizado.",
              },
            ].map((faq, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

