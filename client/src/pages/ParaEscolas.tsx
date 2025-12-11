import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { 
  Users, 
  TrendingUp, 
  Shield, 
  BarChart, 
  Mail, 
  Phone, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function ParaEscolas() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="container flex h-44 items-center justify-between">
          <img 
            src={APP_LOGO} 
            alt="Genius" 
            className="h-40 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
            onClick={() => setLocation("/")}
          />
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/planos")}
              className="hidden text-gray-700 hover:text-primary sm:inline-flex"
            >
              Planos
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/sobre")}
              className="hidden text-gray-700 hover:text-primary sm:inline-flex"
            >
              Sobre Nós
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/contactos")}
              className="hidden text-gray-700 hover:text-primary sm:inline-flex"
            >
              Contactos
            </Button>
            <Button onClick={() => setLocation("/")} className="bg-primary hover:bg-primary/90">
              Voltar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container pt-48 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-sm font-medium text-primary">
            <Users className="h-4 w-4" />
            <span>Soluções para Instituições de Ensino</span>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 sm:text-6xl">
            Transforme a educação na sua{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              instituição
            </span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-gray-600">
            O Genius oferece soluções personalizadas para escolas e universidades que desejam 
            revolucionar a forma como os seus estudantes aprendem.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="group h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
              onClick={() => window.location.href = "mailto:genius@risetech.co.mz?subject=Consulta%20para%20Escola"}
            >
              <Mail className="mr-2 h-5 w-5" />
              Solicitar Consulta
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-14 px-8 text-lg border-2 border-gray-300 hover:border-primary hover:text-primary"
              onClick={() => window.location.href = "tel:+258826074507"}
            >
              <Phone className="mr-2 h-5 w-5" />
              +258 826 074 507
            </Button>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="container py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Como funciona para escolas?
            </h2>
            <p className="text-xl text-gray-600">
              Um processo simples e eficaz para integrar o Genius na sua instituição
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="mb-4 text-xl font-semibold">Contacto Inicial</h3>
              <p className="text-gray-600">
                Entre em contacto connosco por email ou telefone. Responderemos em até 24 horas 
                para agendar uma reunião.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="mb-4 text-xl font-semibold">Avaliação e Proposta</h3>
              <p className="text-gray-600">
                Analisamos as necessidades da sua instituição e apresentamos uma proposta 
                personalizada com preços especiais.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="mb-4 text-xl font-semibold">Implementação</h3>
              <p className="text-gray-600">
                Criamos contas para todos os estudantes, formamos os professores e 
                acompanhamos os primeiros 30 dias gratuitamente.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="container py-24 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Benefícios para a sua instituição
            </h2>
            <p className="text-xl text-gray-600">
              Mais do que uma ferramenta, um parceiro educacional
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: TrendingUp,
                title: "Melhoria no Desempenho",
                description: "Estudantes com acesso ao Genius apresentam melhoria média de 35% nas notas"
              },
              {
                icon: Shield,
                title: "Ambiente Seguro",
                description: "Plataforma controlada, sem acesso a conteúdo impróprio ou distrações"
              },
              {
                icon: BarChart,
                title: "Relatórios Detalhados",
                description: "Dashboard completo para acompanhar o progresso de cada turma e estudante"
              },
              {
                icon: Users,
                title: "Suporte aos Professores",
                description: "Ferramentas para professores monitorizarem e apoiarem os estudantes"
              },
              {
                icon: CheckCircle2,
                title: "Preços Especiais",
                description: "Descontos significativos para instituições (a partir de 350 MZN/estudante)"
              },
              {
                icon: CheckCircle2,
                title: "Formação Incluída",
                description: "Formação gratuita para professores e equipa administrativa"
              }
            ].map((benefit, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container py-24">
        <Card className="mx-auto max-w-4xl bg-gradient-to-br from-primary to-accent p-12 text-center text-white">
          <h2 className="mb-4 text-4xl font-bold">
            Pronto para revolucionar a educação na sua escola?
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Entre em contacto connosco hoje e descubra como o Genius pode transformar 
            a aprendizagem dos seus estudantes.
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="h-14 px-8 text-lg bg-white text-primary hover:bg-gray-100"
                onClick={() => window.location.href = "mailto:genius@risetech.co.mz?subject=Consulta%20para%20Escola"}
              >
                <Mail className="mr-2 h-5 w-5" />
                genius@risetech.co.mz
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                className="h-14 px-8 text-lg bg-white text-primary hover:bg-gray-100"
                onClick={() => window.location.href = "tel:+258826074507"}
              >
                <Phone className="mr-2 h-5 w-5" />
                +258 826 074 507
              </Button>
            </div>
            
            <p className="text-sm opacity-75">
              Horário de atendimento: Segunda a Sexta, 8h - 17h
            </p>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-4">
              <img src={APP_LOGO} alt="Genius" className="h-20 w-auto object-contain" />
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <button onClick={() => setLocation("/planos")} className="hover:text-primary">
                Planos
              </button>
              <button onClick={() => setLocation("/sobre")} className="hover:text-primary">
                Sobre Nós
              </button>
              <button onClick={() => setLocation("/contactos")} className="hover:text-primary">
                Contactos
              </button>
              <a href="mailto:genius@risetech.co.mz" className="hover:text-primary">
                genius@risetech.co.mz
              </a>
              <a href="tel:+258826074507" className="hover:text-primary">
                +258 826 074 507
              </a>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>© 2025 Rise Tech IA & Bravantic. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

