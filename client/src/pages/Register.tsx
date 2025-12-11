import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useGeniusAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Por favor, insere um email válido");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsPending(true);
    try {
      const numericId = Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 1000000) + 1;
      
      const mockUser = {
        id: String(numericId),
        name: email.split("@")[0],
        email,
        onboardingCompleted: false,
      };
      const mockToken = btoa(`${email}:${Date.now()}`);
      
      login(mockUser, mockToken);
      toast.success("Conta criada com sucesso!");
      setLocation("/onboarding");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img
            src={APP_LOGO}
            alt="Genius"
            className="h-16 mx-auto mb-4 cursor-pointer transition-transform hover:scale-105"
            onClick={() => setLocation("/")}
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Conta
          </h1>
          <p className="text-gray-600">
            Junta-te a milhares de estudantes moçambicanos
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repete a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              disabled={isPending}
            />
          </div>

          <Button
            onClick={handleRegister}
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              "A criar conta..."
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Criar Conta
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-gray-600">
            Já tens conta?{" "}
            <button
              onClick={() => setLocation("/login")}
              className="text-primary font-semibold hover:underline"
            >
              Entrar
            </button>
          </p>

          <button
            onClick={() => setLocation("/")}
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para início
          </button>
        </div>
      </Card>
    </div>
  );
}
