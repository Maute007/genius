import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Menu, X, Sparkles, Brain, Clock, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 }
};

function CountUp({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, hasStarted]);

  return (
    <motion.span
      onViewportEnter={() => setHasStarted(true)}
      viewport={{ once: true }}
    >
      {count}{suffix}
    </motion.span>
  );
}

export default function Home() {
  const { isAuthenticated, loading } = useGeniusAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/chat");
    } else {
      setLocation("/register");
    }
  };

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Personalização Total",
      description: "O Genius conhece os teus gostos e nível. Cada explicação é feita de raiz, especialmente para ti."
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Contexto 100% Moçambicano",
      description: "Exemplos, currículo e linguagem que fazem sentido para a tua realidade escolar em Moçambique."
    },
    {
      icon: <Brain className="h-6 w-6 text-primary" />,
      title: "Metodologia Focada no Raciocínio",
      description: "Não te damos o peixe, ensinamos-te a pescar. O nosso método foca-se em construir o teu raciocínio."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Disponibilidade Imediata",
      description: "A dúvida surgiu às 2 da manhã? O teu explicador virtual está sempre online para te ajudar."
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
            : "bg-white border-b border-gray-200"
        }`}
      >
        <div className="container flex h-16 items-center justify-between md:h-20">
          <motion.img
            src={APP_LOGO}
            alt="Genius"
            className="h-12 w-auto object-contain cursor-pointer md:h-16"
            onClick={() => setLocation("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />

          <div className="hidden items-center gap-1 md:flex">
            {["Planos", "Para Escolas", "Sobre Nós", "Contactos"].map((item, i) => (
              <motion.div key={item} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  onClick={() => setLocation(`/${["planos", "escolas", "sobre", "contactos"][i]}`)}
                  className="text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {item}
                </Button>
              </motion.div>
            ))}
            {!isAuthenticated && !loading && (
              <div className="flex items-center gap-2 ml-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={() => setLocation("/login")} className="border-gray-300">
                    Entrar
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => setLocation("/register")} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                    Registar
                  </Button>
                </motion.div>
              </div>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-2 ml-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                    Dashboard
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => setLocation("/chat")} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                    Abrir Chat
                  </Button>
                </motion.div>
              </div>
            )}
          </div>

          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute left-0 right-0 top-full bg-white shadow-xl border-t border-gray-100 md:hidden overflow-hidden"
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="container flex flex-col gap-1 py-4"
              >
                {[
                  { label: "Planos", path: "/planos" },
                  { label: "Para Escolas", path: "/escolas" },
                  { label: "Sobre Nós", path: "/sobre" },
                  { label: "Contactos", path: "/contactos" }
                ].map((item) => (
                  <motion.div key={item.path} variants={fadeInUp}>
                    <Button
                      variant="ghost"
                      onClick={() => { setLocation(item.path); setMobileMenuOpen(false); }}
                      className="w-full justify-start text-gray-700 hover:text-primary hover:bg-primary/5 h-12"
                    >
                      {item.label}
                    </Button>
                  </motion.div>
                ))}
                <motion.div variants={fadeInUp} className="border-t border-gray-100 pt-3 mt-2 space-y-2">
                  {!isAuthenticated && !loading && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => { setLocation("/login"); setMobileMenuOpen(false); }}
                        className="w-full h-12"
                      >
                        Entrar
                      </Button>
                      <Button
                        onClick={() => { setLocation("/register"); setMobileMenuOpen(false); }}
                        className="w-full bg-primary hover:bg-primary/90 text-white h-12"
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
                        className="w-full h-12"
                      >
                        Dashboard
                      </Button>
                      <Button
                        onClick={() => { setLocation("/chat"); setMobileMenuOpen(false); }}
                        className="w-full bg-primary hover:bg-primary/90 text-white h-12"
                      >
                        Abrir Chat
                      </Button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <section className="relative bg-black pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/20 via-transparent to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/10 via-transparent to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container relative z-10">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mb-4 font-['Playfair_Display'] text-3xl font-bold leading-tight text-white sm:text-4xl md:text-6xl lg:text-7xl"
            >
              Deixa de decorar.
              <br />
              <motion.span
                className="text-primary inline-block"
                animate={{ 
                  textShadow: ["0 0 20px rgba(20, 184, 166, 0)", "0 0 30px rgba(20, 184, 166, 0.5)", "0 0 20px rgba(20, 184, 166, 0)"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Começa a dominar.
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto mb-8 max-w-2xl text-base text-gray-300 px-4 sm:text-lg md:text-xl"
            >
              O Genius é a primeira IA desenhada para o <strong className="text-white">contexto moçambicano</strong>.
              Esquece as respostas prontas. Nós guiamos-te passo a passo até dominares a matéria.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="group bg-primary text-white hover:bg-primary/90 w-full sm:w-auto px-6 py-5 sm:px-8 sm:py-6 text-base sm:text-lg shadow-xl shadow-primary/30 transition-all duration-300"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/planos")}
                  className="border-gray-600 text-white hover:bg-white/10 w-full sm:w-auto px-6 py-5 sm:px-8 sm:py-6 text-base sm:text-lg backdrop-blur-sm"
                >
                  Ver Planos
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400"
            >
              {[
                { icon: Check, text: "Sem cartão de crédito" },
                { icon: Check, text: "100 perguntas grátis" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                  </motion.div>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-black border-t border-gray-800/50 py-12 md:py-16">
        <div className="container">
          <motion.div
            className="grid grid-cols-3 gap-4 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { value: 1000, suffix: "+", label: "Estudantes Ativos" },
              { value: 50, suffix: "+", label: "Escolas Parceiras" },
              { value: 95, suffix: "%", label: "Taxa de Satisfação" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mb-1 md:mb-2 font-['Playfair_Display'] text-2xl sm:text-4xl md:text-5xl font-bold text-primary">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container">
          <motion.div
            className="mx-auto max-w-3xl text-center mb-12 md:mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-3 md:mb-4 font-['Playfair_Display'] text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900">
              Porque escolher o Genius?
            </h2>
            <p className="text-base md:text-lg text-gray-600 px-4">
              Mais do que respostas. Entendimento.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20"
              >
                <motion.div
                  className="mb-4 md:mb-6 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="mb-2 md:mb-3 font-['Playfair_Display'] text-lg md:text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-black py-16 md:py-24 overflow-hidden">
        <div className="container">
          <motion.div
            className="mx-auto max-w-3xl text-center mb-12 md:mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-3 md:mb-4 font-['Playfair_Display'] text-2xl sm:text-3xl md:text-5xl font-bold text-white">
              Como funciona?
            </h2>
            <p className="text-base md:text-lg text-gray-400">
              Simples, rápido e eficaz
            </p>
          </motion.div>

          <div className="grid gap-8 md:gap-12 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            
            {[
              { num: 1, title: "Cria o teu perfil", desc: "Responde a algumas perguntas sobre ti, gostos, idade e classe. Isto ajuda o Genius a conhecer-te melhor." },
              { num: 2, title: "Faz a tua pergunta", desc: "Tens uma dúvida? Escreve no chat. O Genius compreende e começa a ensinar-te passo a passo." },
              { num: 3, title: "Aprende de verdade", desc: "Explicações claras, exemplos práticos e verificação de compreensão. Só avança quando estiveres pronto." }
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={i === 0 ? slideInLeft : i === 2 ? slideInRight : fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="text-center relative z-10"
              >
                <motion.div
                  className="mx-auto mb-4 md:mb-6 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary text-xl md:text-2xl font-bold text-white shadow-lg shadow-primary/30"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {step.num}
                </motion.div>
                <h3 className="mb-2 md:mb-3 font-['Playfair_Display'] text-lg md:text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-gray-400 px-4 md:px-0">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              variants={scaleIn}
              className="mb-6 md:mb-8 flex justify-center gap-1"
            >
              {[...Array(5)].map((_, i) => (
                <motion.svg
                  key={i}
                  className="h-6 w-6 md:h-8 md:w-8 fill-yellow-400"
                  viewBox="0 0 20 20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.2, rotate: 20 }}
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </motion.svg>
              ))}
            </motion.div>
            <motion.blockquote
              variants={fadeInUp}
              className="mb-6 md:mb-8 font-['Playfair_Display'] text-lg sm:text-xl md:text-2xl lg:text-3xl italic leading-relaxed text-gray-900 px-4"
            >
              "Quando Albert Einstein disse 'não se pode julgar um peixe pela sua incapacidade de trepar uma árvore', naquele momento entendi que o erro não está nos alunos, mas no formato das aulas."
            </motion.blockquote>
            <motion.p variants={fadeInUp} className="text-base md:text-lg font-semibold text-gray-900">
              — Donald Dimas
            </motion.p>
            <motion.p variants={fadeInUp} className="text-sm md:text-base text-gray-600">
              Fundador do Genius
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="bg-black py-16 md:py-24 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <div className="container relative z-10">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={fadeInUp}
              className="mb-4 md:mb-6 font-['Playfair_Display'] text-2xl sm:text-3xl md:text-5xl font-bold text-white"
            >
              Pronto para começar?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mb-8 md:mb-10 text-base md:text-lg text-gray-400 px-4"
            >
              Junta-te a centenas de estudantes que já aprendem de forma mais inteligente
            </motion.p>
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="group bg-primary text-white hover:bg-primary/90 px-6 py-5 sm:px-8 sm:py-6 text-base sm:text-lg shadow-xl shadow-primary/30"
              >
                Começar Agora - É Grátis
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-800 bg-black py-10 md:py-12">
        <div className="container">
          <motion.div
            className="grid gap-8 sm:grid-cols-2 md:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <img src={APP_LOGO} alt="Genius" className="mb-4 h-10 md:h-12" />
              <p className="text-sm text-gray-400">
                Plataforma educacional com IA para o contexto moçambicano
              </p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h3 className="mb-3 md:mb-4 font-semibold text-white">Plataforma</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setLocation("/planos")} className="hover:text-primary transition-colors">Planos</button></li>
                <li><button onClick={() => setLocation("/escolas")} className="hover:text-primary transition-colors">Para Escolas</button></li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h3 className="mb-3 md:mb-4 font-semibold text-white">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setLocation("/sobre")} className="hover:text-primary transition-colors">Sobre Nós</button></li>
                <li><button onClick={() => setLocation("/contactos")} className="hover:text-primary transition-colors">Contactos</button></li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h3 className="mb-3 md:mb-4 font-semibold text-white">Contacto</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>genius@risetech.co.mz</li>
                <li>+258 826 074 507</li>
              </ul>
            </motion.div>
          </motion.div>
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 md:mt-12 border-t border-gray-800 pt-6 md:pt-8 text-center text-xs md:text-sm text-gray-400"
          >
            © 2025 Rise Tech IA & Bravantic. Todos os direitos reservados.
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
