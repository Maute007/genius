import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { ArrowLeft, LogIn, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useGeniusAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    
    if (!identifier.trim()) {
      setError("Por favor, insere o teu email ou telefone");
      return;
    }
    if (!password.trim()) {
      setError("Por favor, insere a tua senha");
      return;
    }

    setIsPending(true);
    try {
      const email = identifier.includes("@") ? identifier : `${identifier}@genius.mz`;
      const { api } = await import("@/lib/api");
      const response = await api.auth.login(email, password);
      
      login(response.user, response.token);
      toast.success("Bem-vindo de volta!");
      
      if (response.user.onboardingCompleted) {
        setLocation("/chat");
      } else {
        setLocation("/onboarding");
      }
    } catch (err: any) {
      const message = err.message || "Erro ao entrar. Tenta novamente.";
      setError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/10 via-transparent to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/5 via-transparent to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="w-full p-6 sm:p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <motion.div
            className="text-center mb-6 sm:mb-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.img
              src={APP_LOGO}
              alt="Genius"
              className="h-14 sm:h-16 mx-auto mb-4 cursor-pointer"
              onClick={() => setLocation("/")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={fadeInUp}
            />
            <motion.h1 
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
              variants={fadeInUp}
            >
              Entrar
            </motion.h1>
            <motion.p 
              className="text-sm sm:text-base text-gray-600"
              variants={fadeInUp}
            >
              Bem-vindo de volta ao Genius!
            </motion.p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 flex-1">{error}</p>
            </motion.div>
          )}

          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              <Label htmlFor="identifier" className="text-sm font-medium">Email ou Telefone</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="exemplo@email.com ou +258 84 123 4567"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isPending}
                className="mt-1.5 h-11 sm:h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Insere a tua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                disabled={isPending}
                className="mt-1.5 h-11 sm:h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleLogin}
                  disabled={isPending}
                  className="w-full h-11 sm:h-12 text-base shadow-lg shadow-primary/25 transition-all duration-200"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      A entrar...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Entrar
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-6 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-600">
              Não tens conta?{" "}
              <motion.button
                onClick={() => setLocation("/register")}
                className="text-primary font-semibold hover:underline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Criar conta
              </motion.button>
            </p>

            <motion.button
              onClick={() => setLocation("/")}
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 mx-auto transition-colors"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para início
            </motion.button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
