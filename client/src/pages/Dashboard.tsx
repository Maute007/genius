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
  Settings,
  Trash2,
  ChevronDown,
  Plus
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
  const [showMore, setShowMore] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId) return;
    
    setDeletingId(id);
    try {
      await api.conversations.delete(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      toast.success("Conversa removida");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Erro ao remover conversa");
    } finally {
      setDeletingId(null);
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

  const displayCount = showMore ? 20 : 10;
  const recentConversations = conversations.slice(0, displayCount).map((conv) => {
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
      modeKey: conv.mode,
      subject: conv.subject || null,
      topic: conv.topic || null,
      firstMessagePreview: (conv as any).firstMessagePreview || null,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 overflow-x-hidden">
      <AuthHeader />
      
      <div className="pt-20 px-4 sm:container py-6 sm:py-8 max-w-full overflow-x-hidden">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-primary font-medium text-sm mb-1">Bem-vindo de volta</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 truncate bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Olá, {profile?.fullName || user?.name || "Estudante"}!
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              Pronto para dominar mais conhecimento hoje?
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 shrink-0 self-start transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Terminar Sessão</span>
            <span className="sm:hidden">Sair</span>
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

          <TabsContent value="inicio" className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="group relative p-4 sm:p-6 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-primary/10 active:scale-[0.98] sm:hover:scale-[1.02] border-transparent hover:border-primary/20 overflow-hidden bg-white"
                  onClick={action.action}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start gap-3 sm:gap-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 transition-all duration-300 group-hover:shadow-lg ${action.color}`}>
                      <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base group-hover:text-primary transition-colors">{action.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <Card className="p-4 sm:p-6 bg-white border-0 shadow-lg shadow-gray-200/50">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary"></div>
                  Estatísticas
                </h2>
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white shadow-sm">
                          <stat.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-gray-600 font-medium text-sm">{stat.label}</span>
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">{stat.value}</span>
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

              <Card className="p-4 sm:p-6 bg-white border-0 shadow-lg shadow-gray-200/50">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                    </div>
                    <h2 className="text-base sm:text-xl font-bold truncate">Histórico</h2>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => setLocation("/chat")}
                    className="bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 shrink-0 text-xs sm:text-sm px-3 sm:px-4 shadow-lg shadow-primary/25"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                    Nova
                  </Button>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Últimas {displayCount} conversas
                </p>
                {recentConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="mb-4">Ainda não tens conversas.</p>
                    <Button onClick={() => setLocation("/chat")}>
                      Começar agora
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentConversations.map((conversation) => {
                      const modeColors: Record<string, string> = {
                        quick_doubt: "bg-amber-100 text-amber-700",
                        exam_prep: "bg-blue-100 text-blue-700",
                        revision: "bg-emerald-100 text-emerald-700",
                        free_learning: "bg-purple-100 text-purple-700",
                      };
                      
                      return (
                        <div
                          key={conversation.id}
                          className="group p-3 border rounded-xl hover:bg-accent cursor-pointer transition-all hover:shadow-sm flex items-center gap-2"
                          onClick={() => setLocation("/chat")}
                        >
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${modeColors[conversation.modeKey] || "bg-gray-100 text-gray-700"}`}>
                                {conversation.mode}
                              </span>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {conversation.date}
                              </span>
                            </div>
                            <p className="text-sm font-medium truncate">
                              {conversation.firstMessagePreview || conversation.title}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all shrink-0"
                            title="Remover"
                          >
                            {deletingId === conversation.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                    
                    {conversations.length > 10 && !showMore && (
                      <Button 
                        variant="ghost" 
                        className="w-full mt-2 text-muted-foreground"
                        onClick={() => setShowMore(true)}
                      >
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Ver mais ({Math.min(conversations.length, 20) - 10} restantes)
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
