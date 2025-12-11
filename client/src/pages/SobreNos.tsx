import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { 
  Target, 
  Heart, 
  Lightbulb, 
  Users,
  Mail,
  Phone
} from "lucide-react";

export default function SobreNos() {
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
              onClick={() => setLocation("/escolas")}
              className="hidden text-gray-700 hover:text-primary sm:inline-flex"
            >
              Para Escolas
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
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 sm:text-6xl">
            Sobre o{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Genius
            </span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-gray-600">
            Uma iniciativa da Rise Tech IA e Bravantic para revolucionar a educação em Moçambique
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="container py-24">
        <div className="mx-auto max-w-4xl">
          <Card className="p-12">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Porquê o Genius?
              </h2>
            </div>
            
            <div className="space-y-6 text-lg leading-relaxed text-gray-700">
              <p>
                O Genius nasceu de uma observação simples mas poderosa: <strong>cada estudante aprende de forma diferente</strong>. 
                Enquanto uns preferem exemplos visuais, outros aprendem melhor com exercícios práticos. 
                Alguns gostam de futebol, outros de música ou culinária.
              </p>
              
              <p>
                Em Moçambique, milhares de estudantes enfrentam desafios únicos: turmas superlotadas, 
                falta de recursos educacionais, e exemplos de ensino que não refletem a sua realidade local. 
                Um estudante em Maputo que gosta de marrabenta deveria aprender frações com exemplos de música, 
                não com referências a contextos estrangeiros.
              </p>
              
              <p>
                Foi assim que nasceu o Genius: <strong>um professor virtual que se adapta a cada estudante</strong>, 
                usando os seus interesses, o seu contexto e a sua forma preferida de aprender. Não damos respostas 
                prontas – ensinamos a pensar, a raciocinar e a dominar qualquer matéria.
              </p>
              
              <p>
                Desenvolvido pela <strong>Rise Tech IA</strong> em parceria com a <strong>Bravantic</strong>, 
                o Genius combina inteligência artificial de ponta com profundo conhecimento do sistema 
                educacional moçambicano.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="container py-24 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold">Missão</h3>
              <p className="text-gray-700">
                Democratizar o acesso a educação de qualidade em Moçambique através de 
                tecnologia de inteligência artificial personalizada.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold">Visão</h3>
              <p className="text-gray-700">
                Ser a principal plataforma educacional de IA em África, transformando a forma 
                como milhões de estudantes aprendem.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold">Valores</h3>
              <p className="text-gray-700">
                Personalização, excelência educacional, contexto local, acessibilidade e 
                compromisso com o sucesso de cada estudante.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Quem Somos */}
      <section className="container py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Quem Somos
            </h2>
          </div>

          <div className="space-y-8">
            <Card className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Rise Tech IA</h3>
                  <p className="text-lg leading-relaxed text-gray-700">
                    Empresa moçambicana especializada em soluções de inteligência artificial para 
                    educação e negócios. Com uma equipa de engenheiros, educadores e especialistas 
                    em IA, a Rise Tech IA desenvolve tecnologia que resolve problemas reais do 
                    contexto africano.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Bravantic</h3>
                  <p className="text-lg leading-relaxed text-gray-700">
                    Parceiro estratégico especializado em desenvolvimento de software e design de 
                    experiência do utilizador. A Bravantic traz expertise em criar plataformas 
                    escaláveis, intuitivas e acessíveis para o mercado moçambicano.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <Card className="mx-auto max-w-4xl bg-gradient-to-br from-primary to-accent p-12 text-center text-white">
          <h2 className="mb-4 text-4xl font-bold">
            Quer saber mais sobre nós?
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Entre em contacto connosco. Adoraríamos conversar!
          </p>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="h-14 px-8 text-lg bg-white text-primary hover:bg-gray-100"
              onClick={() => window.location.href = "mailto:genius@risetech.co.mz"}
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
              <button onClick={() => setLocation("/escolas")} className="hover:text-primary">
                Para Escolas
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

