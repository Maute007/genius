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
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { motion, AnimatePresence } from "framer-motion";

const PROVINCES = [
  "Maputo Cidade", "Maputo Província", "Gaza", "Inhambane",
  "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa",
];

const INTEREST_OPTIONS = [
  "Futebol", "Música", "Leitura", "Ciência", "Tecnologia", "Arte",
  "Desporto", "Culinária", "Dança", "Cinema", "Natureza", "Matemática",
];

const SCHOOL_TYPES = [
  { value: "self_learner", label: "Estudo sozinho(a)" },
  { value: "public_school", label: "Escola Pública" },
  { value: "private_school", label: "Escola Privada" },
  { value: "public_university", label: "Universidade Pública" },
  { value: "private_university", label: "Universidade Privada" },
  { value: "technical_institute", label: "Instituto Técnico" },
  { value: "non_student", label: "Não sou estudante" },
  { value: "other", label: "Outro" },
] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, login } = useGeniusAuth();
  const [[step, direction], setStepState] = useState([1, 0]);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [isPending, setIsPending] = useState(false);

  const setStep = (newStep: number) => {
    setStepState([newStep, newStep > step ? 1 : -1]);
  };

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
    if (step === 3) {
      if (!province || !city || !schoolType) {
        toast.error("Por favor, preenche a tua localização e tipo de estudante");
        return false;
      }
      if (schoolType !== "self_learner" && schoolType !== "non_student" && !schoolName) {
        toast.error("Por favor, indica o nome da tua escola");
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

    if (!validateStep()) {
      return;
    }

    setIsPending(true);
    try {
      const finalSchoolName = schoolType === "self_learner" || schoolType === "non_student" 
        ? "N/A" 
        : schoolName;
      
      const profileData = {
        fullName: fullName,
        age: parseInt(age, 10),
        grade: grade,
        interests: selectedInterests.length > 0 ? selectedInterests : ["Estudos"],
        province: province,
        city: city,
        schoolName: finalSchoolName,
        schoolType: schoolType as "self_learner" | "non_student" | "public_school" | "private_school" | "public_university" | "private_university" | "technical_institute" | "other",
      };
      
      await api.profile.update(profileData);

      const updatedUser = {
        ...user,
        name: fullName,
        onboardingCompleted: true,
      };
      
      const token = localStorage.getItem("genius_token") || "local-token";
      login(updatedUser, token);

      toast.success("Perfil criado com sucesso!");
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Erro ao criar perfil");
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
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 via-transparent to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/10 via-transparent to-transparent rounded-full blur-3xl"
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
        className="w-full max-w-lg relative z-10"
      >
        <Card className="w-full p-6 sm:p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <motion.div
            className="text-center mb-6 sm:mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <motion.img
              src={APP_LOGO}
              alt="Genius"
              className="h-14 sm:h-16 mx-auto mb-4"
              whileHover={{ scale: 1.05 }}
            />
            <AnimatePresence mode="wait">
              <motion.h1
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
              >
                {step === 1 && "Vamos conhecer-te melhor"}
                {step === 2 && "Quais são os teus interesses?"}
                {step === 3 && "Onde estudas?"}
                {step === 4 && "Estamos quase lá!"}
              </motion.h1>
            </AnimatePresence>
            
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3, 4].map((s) => (
                <motion.div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s <= step ? "bg-primary w-10 sm:w-12" : "bg-gray-200 w-6 sm:w-8"
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: s * 0.1 }}
                />
              ))}
            </div>
          </motion.div>

          <div className="relative min-h-[240px] sm:min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                    <Label htmlFor="fullName" className="text-sm font-medium">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="O teu nome"
                      className="mt-1.5 h-11 sm:h-12"
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                    <Label htmlFor="age" className="text-sm font-medium">Idade *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Ex: 16"
                      className="mt-1.5 h-11 sm:h-12"
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                    <Label htmlFor="grade" className="text-sm font-medium">Classe *</Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger className="mt-1.5 h-11 sm:h-12">
                        <SelectValue placeholder="Seleciona a tua classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {["8ª", "9ª", "10ª", "11ª", "12ª", "Universitário"].map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <p className="text-gray-600 text-sm mb-4">
                    Seleciona os teus interesses (ajuda-nos a personalizar a tua experiência)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((interest, i) => (
                      <motion.div
                        key={interest}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant={selectedInterests.includes(interest) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleInterest(interest)}
                          className={`transition-all duration-200 ${
                            selectedInterests.includes(interest) 
                              ? "shadow-md shadow-primary/25" 
                              : ""
                          }`}
                        >
                          {interest}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  {selectedInterests.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-primary font-medium"
                    >
                      {selectedInterests.length} interesse{selectedInterests.length !== 1 ? "s" : ""} selecionado{selectedInterests.length !== 1 ? "s" : ""}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                    <Label htmlFor="province" className="text-sm font-medium">Província *</Label>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger className="mt-1.5 h-11 sm:h-12">
                        <SelectValue placeholder="Seleciona a tua província" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                  
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                    <Label htmlFor="city" className="text-sm font-medium">Cidade *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Maputo, Beira, Nampula"
                      className="mt-1.5 h-11 sm:h-12"
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                    <Label htmlFor="schoolType" className="text-sm font-medium">Como estudas? *</Label>
                    <Select value={schoolType} onValueChange={setSchoolType}>
                      <SelectTrigger className="mt-1.5 h-11 sm:h-12">
                        <SelectValue placeholder="Seleciona a tua situação" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {schoolType && schoolType !== "self_learner" && schoolType !== "non_student" && (
                    <motion.div 
                      variants={fadeInUp} 
                      initial="hidden" 
                      animate="visible" 
                      transition={{ delay: 0.4 }}
                    >
                      <Label htmlFor="schoolName" className="text-sm font-medium">Nome da Escola/Universidade *</Label>
                      <Input
                        id="schoolName"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Ex: Escola Secundária de Josina Machel"
                        className="mt-1.5 h-11 sm:h-12"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl flex items-center gap-3 border border-green-100"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                    </motion.div>
                    <p className="text-green-800 text-sm">
                      Tudo pronto! Clica em "Começar" para iniciar a tua jornada.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                  >
                    <p className="text-gray-700 text-sm font-medium mb-2">Resumo do teu perfil:</p>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li><strong>Nome:</strong> {fullName}</li>
                      <li><strong>Idade:</strong> {age} anos</li>
                      <li><strong>Classe:</strong> {grade}</li>
                      <li><strong>Localização:</strong> {city}, {province}</li>
                      <li><strong>Interesses:</strong> {selectedInterests.join(", ") || "Estudos"}</li>
                    </ul>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div 
            className="flex justify-between mt-6 sm:mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {step > 1 ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" onClick={handleBack} className="h-11 sm:h-12">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </motion.div>
            ) : (
              <div />
            )}
            
            {step < 4 ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={handleNext} className="h-11 sm:h-12 shadow-lg shadow-primary/25">
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleComplete} 
                  disabled={isPending}
                  className="h-11 sm:h-12 shadow-lg shadow-primary/25"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Começar
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
