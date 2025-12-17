import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { ArrowLeft, Sparkles, Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { motion, AnimatePresence } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useGeniusAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = password.length >= 6 ? (password.length >= 10 ? "strong" : "medium") : "weak";
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleRegister = async () => {
    setError(null);
    
    if (!email.trim() || !email.includes("@")) {
      setError("Por favor, insere um email válido");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem. Verifica se escreveste a mesma senha nos dois campos.");
      return;
    }

    setIsPending(true);
    try {
      const { api } = await import("@/lib/api");
      const response = await api.auth.register(email, password);
      
      login(response.user, response.token);
      toast.success("Conta criada com sucesso!");
      setLocation("/onboarding");
    } catch (err: any) {
      const message = err.message || "Erro ao criar conta. Tenta novamente.";
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
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/5 via-transparent to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
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
              Criar Conta
            </motion.h1>
            <motion.p 
              className="text-sm sm:text-base text-gray-600"
              variants={fadeInUp}
            >
              Junta-te a milhares de estudantes moçambicanos
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
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="mt-1.5 h-11 sm:h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="mt-1.5 h-11 sm:h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 flex gap-1"
                  >
                    <motion.div
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength === "weak" ? "bg-red-400" : 
                        passwordStrength === "medium" ? "bg-yellow-400" : "bg-green-400"
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength === "medium" ? "bg-yellow-400" : 
                        passwordStrength === "strong" ? "bg-green-400" : "bg-gray-200"
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    />
                    <motion.div
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength === "strong" ? "bg-green-400" : "bg-gray-200"
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repete a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  disabled={isPending}
                  className="mt-1.5 h-11 sm:h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20 pr-10"
                />
                <AnimatePresence>
                  {passwordsMatch && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5"
                    >
                      <Check className="h-5 w-5 text-green-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleRegister}
                  disabled={isPending}
                  className="w-full h-11 sm:h-12 text-base shadow-lg shadow-primary/25 transition-all duration-200"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      A criar conta...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Criar Conta
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
              Já tens conta?{" "}
              <motion.button
                onClick={() => setLocation("/login")}
                className="text-primary font-semibold hover:underline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Entrar
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
