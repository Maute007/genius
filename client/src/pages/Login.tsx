import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useGeniusAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      toast.error("Por favor, insere o teu email ou telefone");
      return;
    }
    if (!password.trim()) {
      toast.error("Por favor, insere a tua senha");
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
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar");
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
            Entrar
          </h1>
          <p className="text-gray-600">
            Bem-vindo de volta ao Genius!
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="identifier">Email ou Telefone</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="exemplo@email.com ou +258 84 123 4567"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Insere a tua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              disabled={isPending}
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              "A entrar..."
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Entrar
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-gray-600">
            Não tens conta?{" "}
            <button
              onClick={() => setLocation("/register")}
              className="text-primary font-semibold hover:underline"
            >
              Criar conta
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
