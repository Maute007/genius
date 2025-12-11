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
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { APP_LOGO } from "@/const";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const PROVINCES = [
  "Maputo Cidade",
  "Maputo Província",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa",
];

const INTEREST_OPTIONS = [
  "Futebol",
  "Música",
  "Leitura",
  "Ciência",
  "Tecnologia",
  "Arte",
  "Desporto",
  "Culinária",
  "Dança",
  "Cinema",
  "Natureza",
  "Matemática",
  "História",
  "Jogos",
];

const LEARNING_METHODS = [
  "Com muitos exemplos práticos",
  "Com diagramas e imagens",
  "Com vídeos explicativos",
  "Fazendo exercícios",
  "Lendo textos",
  "Ouvindo explicações",
  "Discutindo em grupo",
  "Resolvendo problemas",
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  // Removed automatic profile check that was causing interruptions
  
  // Step 1: Personal Info
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");

  // Step 2: Interests & Learning
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [otherInterests, setOtherInterests] = useState("");
  const [selectedLearningMethods, setSelectedLearningMethods] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState("");

  // Step 3: Academic Profile
  const [challenges, setChallenges] = useState("");
  const [studyGoals, setStudyGoals] = useState("");

  // Step 4: School Info
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");


  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Perfil criado com sucesso! Bem-vindo ao Genius! 🎉");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleLearningMethod = (method: string) => {
    setSelectedLearningMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const validateStep = () => {
    if (step === 1) {
      if (!fullName || !age || !grade) {
        toast.error("Por favor, preenche todos os campos obrigatórios");
        return false;
      }
      if (parseInt(age) < 5 || parseInt(age) > 100) {
        toast.error("Idade deve estar entre 5 e 100 anos");
        return false;
      }
    }
    if (step === 2) {
      if (selectedInterests.length === 0 && !otherInterests) {
        toast.error("Por favor, seleciona pelo menos um interesse ou escreve outros");
        return false;
      }
    }
    if (step === 4) {
      if (!schoolType || !province || !city) {
        toast.error("Por favor, preenche os campos obrigatórios");
        return false;
      }
      // Nome da escola é opcional para autodidatas e não estudantes
      if (!schoolName && !['self_learner', 'non_student'].includes(schoolType)) {
        toast.error("Por favor, preenche o nome da escola");
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

  const handleSubmit = async () => {
    if (!validateStep()) return;

    // Combine selected interests with other interests
    const allInterests = [...selectedInterests];
    if (otherInterests.trim()) {
      // Simple validation for inappropriate content
      const inappropriate = /\b(sex|porn|erótic|xxx|adult)\b/i;
      if (inappropriate.test(otherInterests)) {
        toast.error("Por favor, evita conteúdo impróprio nos interesses");
        return;
      }
    }

    upsertProfile.mutate({
      fullName,
      whatsapp: whatsapp || undefined,
      age: parseInt(age),
      grade,
      interests: allInterests,
      otherInterests: otherInterests || undefined,
      learningStyle: learningStyle || undefined,
      learningPreferences: selectedLearningMethods.length > 0 ? selectedLearningMethods : undefined,
      challenges: challenges || undefined,
      studyGoals: studyGoals || undefined,
      schoolName: schoolName || 'N/A',
      schoolType: schoolType as any,
      province,
      city,
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="p-8">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-3xl font-bold">Sobre ti</h2>
              <p className="text-muted-foreground">
                Vamos conhecer-te melhor para personalizar a tua experiência
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="mt-2"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="84 123 4567"
                    className="mt-2"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Para suporte e notificações
                  </p>
                </div>

                <div>
                  <Label htmlFor="age">Idade *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ex: 16"
                    min="5"
                    max="100"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="grade">Classe/Ano *</Label>
                  <Input
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Ex: 10ª classe"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-8">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-3xl font-bold">O que gostas?</h2>
              <p className="text-muted-foreground">
                Os teus interesses tornam as explicações mais interessantes
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Seleciona os teus interesses *</Label>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {INTEREST_OPTIONS.map((interest) => (
                    <Button
                      key={interest}
                      type="button"
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className="h-auto py-3"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="otherInterests">Outros interesses (opcional)</Label>
                <Textarea
                  id="otherInterests"
                  value={otherInterests}
                  onChange={(e) => setOtherInterests(e.target.value)}
                  placeholder="Ex: Video games, programação, fotografia, jardinagem..."
                  rows={3}
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Escreve outros interesses que não estão na lista acima
                </p>
              </div>

              <div>
                <Label>Como preferes aprender? (opcional)</Label>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {LEARNING_METHODS.map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={selectedLearningMethods.includes(method) ? "default" : "outline"}
                      className="h-auto py-3 text-left"
                      onClick={() => toggleLearningMethod(method)}
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="learningStyle">Outra forma de aprender (opcional)</Label>
                <Textarea
                  id="learningStyle"
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  placeholder="Ex: Gosto de aprender fazendo experiências práticas..."
                  rows={2}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card className="p-8">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-3xl font-bold">Objetivos e Desafios</h2>
              <p className="text-muted-foreground">
                Ajuda-nos a entender como podemos apoiar-te melhor
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="studyGoals">Quais são os teus objetivos académicos? (opcional)</Label>
                <Textarea
                  id="studyGoals"
                  value={studyGoals}
                  onChange={(e) => setStudyGoals(e.target.value)}
                  placeholder="Ex: Passar no exame de Matemática, entrar na universidade, melhorar as notas..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="challenges">Tens alguma dificuldade ou desafio? (opcional)</Label>
                <Textarea
                  id="challenges"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Ex: Tenho dificuldade em Física, não consigo concentrar-me muito tempo..."
                  rows={3}
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Isto ajuda o Genius a adaptar a forma de ensinar às tuas necessidades
                </p>
              </div>
            </div>
          </Card>
        );

      case 4:
        return (
          <Card className="p-8">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-3xl font-bold">Sobre a tua escola</h2>
              <p className="text-muted-foreground">
                Informações sobre a tua escola (para estatísticas)
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="schoolName">
                  Nome da Escola {!['self_learner', 'non_student'].includes(schoolType) && '*'}
                  {['self_learner', 'non_student'].includes(schoolType) && ' (opcional)'}
                </Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder={
                    ['self_learner', 'non_student'].includes(schoolType)
                      ? "Deixa em branco se não aplicável"
                      : "Ex: Escola Secundária Josina Machel"
                  }
                  className="mt-2"
                  disabled={['self_learner', 'non_student'].includes(schoolType)}
                />
              </div>

              <div>
                <Label htmlFor="schoolType">Tipo de Instituição *</Label>
                <Select value={schoolType} onValueChange={setSchoolType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Seleciona o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_learner">Autodidata / Estudo por conta própria</SelectItem>
                    <SelectItem value="non_student">Não estudante</SelectItem>
                    <SelectItem value="public_school">Escola Pública</SelectItem>
                    <SelectItem value="private_school">Escola Privada</SelectItem>
                    <SelectItem value="public_university">Universidade Pública</SelectItem>
                    <SelectItem value="private_university">Universidade Privada</SelectItem>
                    <SelectItem value="technical_institute">Instituto Técnico</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="province">Província *</Label>
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Seleciona a província" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((prov) => (
                        <SelectItem key={prov} value={prov}>
                          {prov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city">Cidade/Distrito *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Maputo, Matola, Beira..."
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50">
      <div className="container py-8">
        <div className="mb-12 flex flex-col items-center gap-4">
          <img 
            src={APP_LOGO} 
            alt="Genius" 
            className="h-40 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
            onClick={() => setLocation("/")}
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Vamos conhecer-te melhor</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="mx-auto max-w-2xl">
          {renderStep()}

          <div className="mt-6 flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => (step === 1 ? setLocation("/") : setStep(step - 1))}
              disabled={upsertProfile.isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            {step < 4 ? (
              <Button onClick={handleNext} disabled={upsertProfile.isPending}>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={upsertProfile.isPending}
                className="min-w-[200px]"
              >
                {upsertProfile.isPending ? (
                  "A criar perfil..."
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Começar a aprender!
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

