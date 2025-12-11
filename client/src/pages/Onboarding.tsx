import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";

const PROVINCES = [
  "Maputo Cidade", "Maputo Província", "Gaza", "Inhambane",
  "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa",
];

const INTEREST_OPTIONS = [
  "Futebol", "Música", "Leitura", "Ciência", "Tecnologia", "Arte",
  "Desporto", "Culinária", "Dança", "Cinema", "Natureza", "Matemática",
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, login } = useGeniusAuth();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [province, setProvince] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
    }
  }, [user]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const validateStep = () => {
    if (step === 1) {
      if (!fullName || !age || !grade) {
        toast.error("Por favor, preenche todos os campos obrigatórios");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error("Utilizador não encontrado");
      return;
    }

    setIsPending(true);
    try {
      const userId = parseInt(user.id, 10);
      
      await api.profiles.update(userId, {
        name: fullName,
        age: parseInt(age, 10),
        grade: grade,
        interests: selectedInterests.join(','),
        province: province || undefined,
        onboardingCompleted: true,
      });

      const updatedUser = {
        ...user,
        name: fullName,
        age: parseInt(age, 10),
        grade: grade,
        interests: selectedInterests.join(','),
        province: province,
        onboardingCompleted: true,
      };
      
      const token = localStorage.getItem("genius_token") || "local-token";
      login(updatedUser, token);

      toast.success("Perfil criado com sucesso!");
      setLocation("/chat");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Erro ao criar perfil");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <img
            src={APP_LOGO}
            alt="Genius"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 1 && "Vamos conhecer-te melhor"}
            {step === 2 && "Quais são os teus interesses?"}
            {step === 3 && "Estamos quase lá!"}
          </h1>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${
                  s <= step ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="O teu nome"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade *</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex: 16"
              />
            </div>
            <div>
              <Label htmlFor="grade">Classe *</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleciona a tua classe" />
                </SelectTrigger>
                <SelectContent>
                  {["8ª", "9ª", "10ª", "11ª", "12ª", "Universitário"].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm mb-4">
              Seleciona os teus interesses (ajuda-nos a personalizar a tua experiência)
            </p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <Button
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="province">Província</Label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleciona a tua província" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <p className="text-green-800 text-sm">
                Tudo pronto! Clica em "Começar" para iniciar a tua jornada.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          ) : (
            <div />
          )}
          
          {step < 3 ? (
            <Button onClick={handleNext}>
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isPending}>
              {isPending ? "A guardar..." : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Começar
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
