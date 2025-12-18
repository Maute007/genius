import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, Conversation, Profile } from "@/lib/api";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import AuthHeader from "@/components/AuthHeader";
import { 
  MessageSquare, 
  BookOpen, 
  Target, 
  Clock, 
  Zap,
  User,
  MessageCircle,
  Calendar,
  Loader2,
  Save,
  LogOut,
  Settings
} from "lucide-react";
import { toast } from "sonner";

const PROVINCES = [
  "Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", 
  "Sofala", "Manica", "Tete", "Zambézia", 
  "Nampula", "Cabo Delgado", "Niassa"
];

const GRADES = [
  "8ª Classe", "9ª Classe", "10ª Classe", 
  "11ª Classe", "12ª Classe", "Universidade"
];

const SCHOOL_TYPES = [
  { value: "public_school", label: "Escola Pública" },
  { value: "private_school", label: "Escola Privada" },
  { value: "public_university", label: "Universidade Pública" },
  { value: "private_university", label: "Universidade Privada" },
  { value: "technical_institute", label: "Instituto Técnico" },
  { value: "self_learner", label: "Estudo Sozinho" },
  { value: "non_student", label: "Não sou estudante" },
  { value: "other", label: "Outro" },
];

const INTERESTS = [
  "Matemática", "Física", "Química", "Biologia",
  "Português", "Inglês", "História", "Geografia",
  "Filosofia", "Programação", "Economia", "Direito"
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user, logout, refreshAuth } = useGeniusAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const tab = params.get("tab");
    if (tab === "perfil") {
      setActiveTab("perfil");
    }
  }, [search]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [convs, profileData] = await Promise.all([
          api.conversations.list().catch(() => []),
          api.profile.get().catch(() => null)
        ]);
        setConversations(convs || []);
        setProfile(profileData);
        
        if (profileData) {
          setFullName(profileData.fullName || "");
          setAge(profileData.age?.toString() || "");
          setGrade(profileData.grade || "");
          setProvince(profileData.province || "");
          setCity(profileData.city || "");
          setSchoolType(profileData.schoolType || "");
          setSchoolName(profileData.schoolName || "");
          setSelectedInterests(profileData.interests || []);
          setWhatsapp(profileData.whatsapp || "");
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Erro ao terminar sessão");
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName || !age || !grade || !province || !city || !schoolType) {
      toast.error("Por favor, preenche todos os campos obrigatórios");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      toast.error("Idade inválida");
      return;
    }

    setSaving(true);
    try {
      const effectiveSchoolName = (schoolType === "self_learner" || schoolType === "non_student") 
        ? "N/A" 
        : schoolName;

      if (!effectiveSchoolName && schoolType !== "self_learner" && schoolType !== "non_student") {
        toast.error("Por favor, insere o nome da tua escola");
        setSaving(false);
        return;
      }

      await api.profile.update({
        fullName,
        age: ageNum,
        grade,
        province,
        city,
        schoolType: schoolType as any,
        schoolName: effectiveSchoolName || "N/A",
        interests: selectedInterests,
        whatsapp: whatsapp || undefined,
      });
      
      toast.success("Perfil guardado com sucesso!");
      
      if (refreshAuth) {
        await refreshAuth();
      }
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      toast.error(error.message || "Erro ao guardar perfil");
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const quickActions = [
    {
      title: "Começar a Estudar",
      description: "Abre o chat e faz uma pergunta",
      icon: MessageSquare,
      color: "bg-teal-50 text-teal-600",
      action: () => setLocation("/chat"),
    },
    {
      title: "Revisão",
      description: "Revê tópicos estudados",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      action: () => setLocation("/chat"),
    },
    {
      title: "Preparação Exame",
      description: "Prepara-te para exames",
      icon: Target,
      color: "bg-purple-50 text-purple-600",
      action: () => setLocation("/chat"),
    },
  ];

  const stats = [
    {
      label: "Total de conversas",
      value: conversations.length.toString(),
      icon: MessageSquare,
    },
    {
      label: "Modo mais usado",
      value: conversations.length > 0 
        ? getMostUsedMode(conversations) 
        : "N/A",
      icon: Zap,
    },
    {
      label: "Última atividade",
      value: conversations.length > 0 
        ? new Date(conversations[0]?.updatedAt).toLocaleDateString("pt-MZ") 
        : "N/A",
      icon: Clock,
    },
  ];

  function getMostUsedMode(convs: Conversation[]): string {
    const modeLabels: Record<string, string> = {
      quick_doubt: "Dúvida Rápida",
      exam_prep: "Preparação",
      revision: "Revisão",
      free_learning: "Livre"
    };
    const counts: Record<string, number> = {};
    convs.forEach(c => {
      counts[c.mode] = (counts[c.mode] || 0) + 1;
    });
    const maxMode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return maxMode ? modeLabels[maxMode[0]] || maxMode[0] : "N/A";
  }

  const recentConversations = conversations.slice(0, 5).map((conv) => {
    const modeLabels: Record<string, string> = {
      quick_doubt: "Dúvida Rápida",
      exam_prep: "Preparação para Exame",
      revision: "Revisão",
      free_learning: "Aprendizagem Livre"
    };

    return {
      id: conv.id,
      title: conv.title || "Conversa sem título",
      mode: modeLabels[conv.mode] || conv.mode,
      subject: conv.subject || null,
      topic: conv.topic || null,
      date: new Date(conv.createdAt).toLocaleDateString("pt-MZ"),
    };
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      <AuthHeader />
      
      <div className="pt-20 container py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
              Olá, {profile?.fullName || user?.name || "Estudante"}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Bem-vindo de volta ao Genius. Pronto para dominar mais conhecimento hoje?
            </p>
          </div>
          <Button 
            variant="outline" 
            className="text-red-600 border-red-200 hover:bg-red-50 shrink-0"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Terminar Sessão
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="inicio" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Início
            </TabsTrigger>
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Meu Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inicio" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="p-6 transition-all cursor-pointer hover:shadow-lg hover:scale-105"
                  onClick={action.action}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">Estatísticas</h2>
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <stat.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-bold mb-4">Teu Perfil</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-semibold">{profile?.fullName || user?.name || "Estudante"}</p>
                      </div>
                    </div>
                    {profile?.grade && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Classe</p>
                          <p className="font-semibold">{profile.grade}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full"
                    onClick={() => setActiveTab("perfil")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="h-5 w-5 text-teal-600" />
                  <h2 className="text-xl font-bold">Histórico de Conversas</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Continua de onde paraste ou revê o que já estudaste
                </p>
                {recentConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">Ainda não tens conversas.</p>
                    <Button onClick={() => setLocation("/chat")}>
                      Começar agora
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-all hover:shadow-md"
                        onClick={() => setLocation("/chat")}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base mb-1">
                              {conversation.title}
                            </h4>
                            {(conversation.subject || conversation.topic) && (
                              <p className="text-xs text-teal-600 mb-1">
                                {conversation.subject && `${conversation.subject}`}
                                {conversation.topic && ` - ${conversation.topic}`}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {conversation.date}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-muted rounded-full">
                            {conversation.mode}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {recentConversations.length >= 5 && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => setLocation("/chat")}
                      >
                        Ver todas as conversas
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="h-5 w-5" />
                Editar Perfil
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="O teu nome completo"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Idade *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="A tua idade"
                      min={10}
                      max={100}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="grade">Classe/Nível *</Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Seleciona a tua classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+258 84 XXX XXXX"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="province">Província *</Label>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Seleciona a tua província" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Maputo, Beira, Nampula"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="schoolType">Como estudas? *</Label>
                    <Select value={schoolType} onValueChange={setSchoolType}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Seleciona a tua situação" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {schoolType && schoolType !== "self_learner" && schoolType !== "non_student" && (
                    <div>
                      <Label htmlFor="schoolName">Nome da Escola/Universidade *</Label>
                      <Input
                        id="schoolName"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Ex: Escola Secundária de Josina Machel"
                        className="mt-1.5"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Label className="mb-3 block">Interesses (seleciona pelo menos 1)</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedInterests.includes(interest)
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Alterações
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
