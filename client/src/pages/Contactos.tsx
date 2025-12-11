import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  MessageSquare
} from "lucide-react";

export default function Contactos() {
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
              onClick={() => setLocation("/sobre")}
              className="hidden text-gray-700 hover:text-primary sm:inline-flex"
            >
              Sobre Nós
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
            Entre em{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Contacto
            </span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-gray-600">
            Estamos aqui para ajudar. Escolha a melhor forma de nos contactar.
          </p>
        </div>
      </section>

      {/* Formas de Contacto */}
      <section className="container py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Email */}
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Email</h3>
              <p className="mb-4 text-gray-600">
                A forma mais rápida de nos contactar. Respondemos em até 24 horas.
              </p>
              <a 
                href="mailto:genius@risetech.co.mz"
                className="text-lg font-semibold text-primary hover:underline"
              >
                genius@risetech.co.mz
              </a>
              <div className="mt-6">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = "mailto:genius@risetech.co.mz"}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Enviar Email
                </Button>
              </div>
            </Card>

            {/* Telefone */}
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Telefone</h3>
              <p className="mb-4 text-gray-600">
                Ligue-nos directamente durante o horário de expediente.
              </p>
              <a 
                href="tel:+258826074507"
                className="text-lg font-semibold text-primary hover:underline"
              >
                +258 826 074 507
              </a>
              <div className="mt-6">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = "tel:+258826074507"}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Ligar Agora
                </Button>
              </div>
            </Card>

            {/* WhatsApp */}
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">WhatsApp</h3>
              <p className="mb-4 text-gray-600">
                Envie-nos uma mensagem no WhatsApp para suporte rápido.
              </p>
              <a 
                href="https://wa.me/258826074507"
                className="text-lg font-semibold text-primary hover:underline"
              >
                +258 826 074 507
              </a>
              <div className="mt-6">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.open("https://wa.me/258826074507", "_blank")}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Abrir WhatsApp
                </Button>
              </div>
            </Card>

            {/* Horário */}
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">Horário de Atendimento</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Segunda a Sexta:</span>
                  <span>8h00 - 17h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sábado:</span>
                  <span>9h00 - 13h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Domingo:</span>
                  <span>Fechado</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                * Emails enviados fora do horário serão respondidos no próximo dia útil
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Perguntas Frequentes */}
      <section className="container py-24 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Respostas rápidas às dúvidas mais comuns
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Quanto tempo demora para receber resposta?",
                answer: "Respondemos a todos os emails em até 24 horas durante dias úteis. Chamadas telefónicas são atendidas imediatamente durante o horário de expediente."
              },
              {
                question: "Como posso solicitar uma demonstração para a minha escola?",
                answer: "Envie um email para genius@risetech.co.mz com o assunto 'Demonstração para Escola' incluindo o nome da instituição e número de estudantes. Agendaremos uma reunião em até 48 horas."
              },
              {
                question: "Oferecem suporte técnico?",
                answer: "Sim! Oferecemos suporte técnico completo por email, telefone e WhatsApp durante o horário de expediente. Para utilizadores premium, também oferecemos suporte prioritário."
              },
              {
                question: "Posso agendar uma reunião presencial?",
                answer: "Sim, agendamos reuniões presenciais em Maputo mediante marcação prévia. Entre em contacto connosco para agendar."
              }
            ].map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <p className="text-gray-700">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <Card className="mx-auto max-w-4xl bg-gradient-to-br from-primary to-accent p-12 text-center text-white">
          <h2 className="mb-4 text-4xl font-bold">
            Ainda tem dúvidas?
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Não hesite em contactar-nos. Estamos aqui para ajudar!
          </p>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="h-14 px-8 text-lg bg-white text-primary hover:bg-gray-100"
              onClick={() => window.location.href = "mailto:genius@risetech.co.mz"}
            >
              <Mail className="mr-2 h-5 w-5" />
              Enviar Email
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              className="h-14 px-8 text-lg bg-white text-primary hover:bg-gray-100"
              onClick={() => window.location.href = "tel:+258826074507"}
            >
              <Phone className="mr-2 h-5 w-5" />
              Ligar Agora
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
              <button onClick={() => setLocation("/sobre")} className="hover:text-primary">
                Sobre Nós
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

