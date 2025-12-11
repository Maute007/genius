import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { APP_LOGO, getLoginUrl } from "@/const";
import { useState } from "react";

export default function Home() {
  const { isAuthenticated, loading } = useGeniusAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/chat");
    } else {
      setLocation("/register");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation - WHITE */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="container flex h-20 items-center justify-between md:h-28">
          <img 
            src={APP_LOGO} 
            alt="Genius" 
            className="h-16 w-auto object-contain cursor-pointer transition-transform hover:scale-105 md:h-24"
            onClick={() => setLocation("/")}
          />
          
          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/planos")}
              className="text-gray-700 hover:text-primary"
            >
              Planos
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/escolas")}
              className="text-gray-700 hover:text-primary"
            >
              Para Escolas
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/sobre")}
              className="text-gray-700 hover:text-primary"
            >
              Sobre Nós
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/contactos")}
              className="text-gray-700 hover:text-primary"
            >
              Contactos
            </Button>
            {!isAuthenticated && !loading && (
              <>
                <Button variant="outline" onClick={() => setLocation("/login")}>
                  Entrar
                </Button>
                <Button onClick={() => setLocation("/register")} className="bg-primary hover:bg-primary/90 text-white">
                  Registar
                </Button>
              </>
            )}
            {isAuthenticated && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={() => setLocation("/chat")} 
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Abrir Chat
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full border-b border-gray-200 bg-white shadow-lg md:hidden">
            <div className="container flex flex-col gap-2 py-4">
              <Button 
                variant="ghost" 
                onClick={() => { setLocation("/planos"); setMobileMenuOpen(false); }}
                className="w-full justify-start text-gray-700 hover:text-primary"
              >
                Planos
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => { setLocation("/escolas"); setMobileMenuOpen(false); }}
                className="w-full justify-start text-gray-700 hover:text-primary"
              >
                Para Escolas
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => { setLocation("/sobre"); setMobileMenuOpen(false); }}
                className="w-full justify-start text-gray-700 hover:text-primary"
              >
                Sobre Nós
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => { setLocation("/contactos"); setMobileMenuOpen(false); }}
                className="w-full justify-start text-gray-700 hover:text-primary"
              >
                Contactos
              </Button>
              {!isAuthenticated && !loading && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => { setLocation("/login"); setMobileMenuOpen(false); }}
                    className="w-full"
                  >
                    Entrar
                  </Button>
                  <Button 
                    onClick={() => { setLocation("/register"); setMobileMenuOpen(false); }}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    Registar
                  </Button>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => { setLocation("/dashboard"); setMobileMenuOpen(false); }}
                    className="w-full"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    onClick={() => { setLocation("/chat"); setMobileMenuOpen(false); }}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    Abrir Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { 
                      localStorage.removeItem("genius_token");
                      localStorage.removeItem("genius_user");
                      window.location.reload();
                    }}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Sair
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - BLACK */}
      <section className="relative bg-black pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 font-['Playfair_Display'] text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              Deixa de decorar.
              <br />
              <span className="text-primary">Começa a dominar.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 md:text-xl">
              O Genius é a primeira IA desenhada para o <strong className="text-white">contexto moçambicano</strong>.
              Esquece as respostas prontas. Nós guiamos-te passo a passo até dominares a matéria, adaptando-nos ao teu ritmo e ao teu estilo.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="group bg-primary text-white hover:bg-primary/90 px-8 py-6 text-lg"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/planos")}
                className="border-gray-600 text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                Ver Planos
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>100 perguntas grátis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - BLACK (continuação) */}
      <section className="bg-black border-t border-gray-800 py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 font-['Playfair_Display'] text-5xl font-bold text-primary">1000+</div>
              <div className="text-gray-400">Estudantes Ativos</div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-['Playfair_Display'] text-5xl font-bold text-primary">50+</div>
              <div className="text-gray-400">Escolas Parceiras</div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-['Playfair_Display'] text-5xl font-bold text-primary">95%</div>
              <div className="text-gray-400">Taxa de Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - WHITE */}
      <section className="bg-white py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 font-['Playfair_Display'] text-3xl font-bold text-gray-900 md:text-5xl">
              Porque escolher o Genius?
            </h2>
            <p className="text-lg text-gray-600">
              Mais do que respostas. Entendimento.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <div className="h-8 w-8 rounded-full border-2 border-primary"></div>
              </div>
              <h3 className="mb-3 font-['Playfair_Display'] text-xl font-bold text-gray-900">
                Personalização Total
              </h3>
              <p className="leading-relaxed text-gray-600">
                O Genius conhece os teus gostos e nível. Cada explicação é feita de raiz, especialmente para ti.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <div className="h-8 w-8 rounded-lg border-2 border-primary"></div>
              </div>
              <h3 className="mb-3 font-['Playfair_Display'] text-xl font-bold text-gray-900">
                Contexto 100% Moçambicano
              </h3>
              <p className="leading-relaxed text-gray-600">
                Exemplos, currículo e linguagem que fazem sentido para a tua realidade escolar em Moçambique.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <div className="h-8 w-8 border-2 border-primary"></div>
              </div>
              <h3 className="mb-3 font-['Playfair_Display'] text-xl font-bold text-gray-900">
                Metodologia Focada no Raciocínio
              </h3>
              <p className="leading-relaxed text-gray-600">
                Não te damos o peixe, ensinamos-te a pescar. O nosso método foca-se em construir o teu raciocínio para que saibas resolver qualquer problema.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <div className="h-8 w-8 rounded-full bg-primary"></div>
              </div>
              <h3 className="mb-3 font-['Playfair_Display'] text-xl font-bold text-gray-900">
                Disponibilidade Imediata
              </h3>
              <p className="leading-relaxed text-gray-600">
                A dúvida surgiu às 2 da manhã? O teu explicador virtual está sempre online para te ajudar a desbloquear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - BLACK */}
      <section className="bg-black py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 font-['Playfair_Display'] text-3xl font-bold text-white md:text-5xl">
              Como funciona?
            </h2>
            <p className="text-lg text-gray-400">
              Simples, rápido e eficaz
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-3 font-['Playfair_Display'] text-xl font-bold text-white">
                Cria o teu perfil
              </h3>
              <p className="text-gray-400">
                Responde a algumas perguntas sobre ti, gostos, idade e classe. Isto ajuda o Genius a conhecer-te melhor.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-3 font-['Playfair_Display'] text-xl font-bold text-white">
                Faz a tua pergunta
              </h3>
              <p className="text-gray-400">
                Tens uma dúvida? Escreve no chat. O Genius compreende e começa a ensinar-te passo a passo.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-3 font-['Playfair_Display'] text-xl font-bold text-white">
                Aprende de verdade
              </h3>
              <p className="text-gray-400">
                Explicações claras, exemplos práticos e verificação de compreensão. Só avança quando estiveres pronto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Quote - WHITE */}
      <section className="bg-white py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-8 w-8 fill-yellow-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <blockquote className="mb-8 font-['Playfair_Display'] text-2xl italic leading-relaxed text-gray-900 md:text-3xl md:leading-relaxed">
              "Quando Albert Einstein disse 'não se pode julgar um peixe pela sua incapacidade de trepar uma árvore', naquele momento entendi que o erro não está nos alunos, mas no formato das aulas. Cada mente tem o seu ritmo, o seu talento e o seu terreno fértil — a verdadeira educação começa quando paramos de comparar e começamos a compreender."
            </blockquote>
            <p className="text-lg font-semibold text-gray-900">— Donald Dimas</p>
            <p className="text-gray-600">Fundador do Genius</p>
          </div>
        </div>
      </section>

      {/* Final CTA - BLACK */}
      <section className="bg-black py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 font-['Playfair_Display'] text-3xl font-bold text-white md:text-5xl">
              Pronto para começar?
            </h2>
            <p className="mb-10 text-lg text-gray-400">
              Junta-te a centenas de estudantes que já aprendem de forma mais inteligente
            </p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="group bg-primary text-white hover:bg-primary/90 px-8 py-6 text-lg"
            >
              Começar Agora - É Grátis
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - BLACK */}
      <footer className="border-t border-gray-800 bg-black py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <img src={APP_LOGO} alt="Genius" className="mb-4 h-12" />
              <p className="text-sm text-gray-400">
                Plataforma educacional com IA para o contexto moçambicano
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Plataforma</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => setLocation("/planos")} className="hover:text-primary">
                    Planos
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/escolas")} className="hover:text-primary">
                    Para Escolas
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => setLocation("/sobre")} className="hover:text-primary">
                    Sobre Nós
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/contactos")} className="hover:text-primary">
                    Contactos
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Contacto</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>genius@risetech.co.mz</li>
                <li>+258 826 074 507</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2025 Rise Tech IA & Bravantic. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

