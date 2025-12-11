import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, CreditCard, ArrowLeft } from "lucide-react";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";

const PLAN_DETAILS = {
  free: { name: "Gratuito", price: 0, period: "" },
  student: { name: "Estudante", price: 500, period: "/por mês" },
  student_plus: { name: "Estudante+", price: 1000, period: "/por mês" },
  family: { name: "Família", price: 2000, period: "/por mês" }
};

type PlanId = keyof typeof PLAN_DETAILS;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user } = useGeniusAuth();
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "emola" | "mkesh">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const queryParams = new URLSearchParams(window.location.search);
  const planId = (queryParams.get("plan") || "free") as PlanId;
  const plan = PLAN_DETAILS[planId];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (planId !== "free" && !phoneNumber.trim()) {
      toast.error("Número de telefone obrigatório");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Por favor, aceite os termos e condições");
      return;
    }

    if (planId !== "free") {
      const phoneRegex = /^(84|85|86|87)\d{7}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
        toast.error("Número inválido");
        return;
      }
    }

    setIsPending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Bem-vindo ao plano ${plan.name}!`);
      setLocation("/dashboard");
    } catch {
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation("/planos")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Planos
          </Button>
          <h1 className="text-3xl font-bold">Finalizar Subscrição</h1>
          <p className="text-muted-foreground mt-2">
            Complete o seu pagamento para activar o plano {plan.name}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Plano</CardTitle>
              <CardDescription>Detalhes da sua subscrição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="font-semibold text-lg">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {planId === "free" ? "Plano Gratuito" : "Subscrição Mensal"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {plan.price === 0 ? "Grátis" : `${plan.price} MZN`}
                  </p>
                  {plan.price > 0 && (
                    <p className="text-sm text-muted-foreground">{plan.period}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Informações da Conta</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Nome: {user?.name || "N/A"}</p>
                  <p>Email: {user?.email || "N/A"}</p>
                </div>
              </div>

              {planId !== "free" && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Pagamento Simulado</p>
                  <p className="text-xs text-blue-700">
                    Este é um ambiente de teste. Nenhum pagamento real será processado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Detalhes do Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {planId !== "free" && (
                  <>
                    <div className="space-y-3">
                      <Label>Método de Pagamento</Label>
                      <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                          <RadioGroupItem value="mpesa" id="mpesa" />
                          <Label htmlFor="mpesa" className="cursor-pointer flex-1">M-Pesa</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                          <RadioGroupItem value="emola" id="emola" />
                          <Label htmlFor="emola" className="cursor-pointer flex-1">E-Mola</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                          <RadioGroupItem value="mkesh" id="mkesh" />
                          <Label htmlFor="mkesh" className="cursor-pointer flex-1">Mkesh</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Número de Telefone</Label>
                      <Input
                        id="phone"
                        placeholder="84 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        maxLength={11}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer leading-tight">
                    Aceito os termos e condições
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : planId === "free" ? (
                    "Activar Plano Gratuito"
                  ) : (
                    `Pagar ${plan.price} MZN`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
