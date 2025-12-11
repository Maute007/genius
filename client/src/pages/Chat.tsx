import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Send, Loader2, Menu, LogOut, User, Zap, BookOpen, RotateCcw, Sparkles, Plus, MessageSquare, X, ChevronLeft, ChevronRight, Trash2, Lock, Crown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { PlanBadge } from "@/components/PlanBadge";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useQueryClient } from "@tanstack/react-query";

const MODES = [
  { value: "quick_doubt", label: "Dúvida Rápida", icon: Zap, description: "Resposta focada" },
  { value: "exam_prep", label: "Preparação Exame", icon: BookOpen, description: "Estudo profundo" },
  { value: "revision", label: "Revisão", icon: RotateCcw, description: "Rever tópicos" },
  { value: "free_learning", label: "Aprendizagem Livre", icon: Sparkles, description: "Explorar" },
];

// Conversation Item Component with inline title editing
function ConversationItem({
  conversation,
  isActive,
  icon: Icon,
  onSelect,
  onTitleUpdate,
  onDelete,
}: {
  conversation: any;
  isActive: boolean;
  icon: any;
  onSelect: () => void;
  onTitleUpdate: () => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversation.title || "");
  const [showDelete, setShowDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleMutation = trpc.chat.updateTitle.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      onTitleUpdate();
      toast.success("Título atualizado!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== conversation.title) {
      updateTitleMutation.mutate({
        conversationId: conversation.id,
        title: editedTitle.trim(),
      });
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setEditedTitle(conversation.title || "");
      setIsEditing(false);
    }
  };

  const displayTitle = conversation.title || "Nova Conversa";
  const displayDate = new Date(conversation.createdAt).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div
      className={`w-full rounded-lg p-3 transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-gray-100 text-gray-700"
      }`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              className="w-full text-sm font-medium bg-white border border-primary rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={updateTitleMutation.isPending}
            />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isActive) {
                  setIsEditing(true);
                } else {
                  onSelect();
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="w-full text-left"
            >
              <p className="text-sm font-medium truncate">
                {displayTitle}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {displayDate}
              </p>
            </button>
          )}
        </div>
        {showDelete && !isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
            title="Apagar conversa"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const { user, logout } = useGeniusAuth();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<string>("quick_doubt");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Fechada por padrão no mobile
  const [, forceUpdate] = useState({});

  // Query para obter status da subscription
  const { data: subscriptionData } = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: !!user,
    staleTime: 60000,
  });

  const userPlan = subscriptionData?.plan || "free";
  const questionsUsed = subscriptionData?.questionsUsed || 0;
  const questionsLimit = subscriptionData?.questionsLimit || null;
  const isAtLimit = questionsLimit !== null && questionsUsed >= questionsLimit;

  // Verificar se modo está disponível no plano
  const isModeAvailable = (modeValue: string) => {
    if (userPlan === "free") return modeValue === "quick_doubt";
    if (userPlan === "student") return modeValue !== "free_learning";
    return true; // student_plus e family tem tudo
  };

  // Otimizações de performance: staleTime para evitar refetch constante
  const { data: activeData, isLoading: loadingActive } = trpc.chat.getActive.useQuery(
    { mode: mode as any },
    { 
      enabled: !!mode && !!user, // Só executa se estiver autenticado
      staleTime: 30000, // 30 segundos
      refetchOnWindowFocus: false,
    }
  );

  const { data: conversationsList, refetch: refetchConversations } = trpc.chat.listConversations.useQuery(
    undefined,
    {
      enabled: !!user, // Só executa se estiver autenticado
      staleTime: 60000, // 1 minuto
      refetchOnWindowFocus: false,
    }
  );

  // Buscar conversa selecionada
  const { data: selectedConvData, isLoading: loadingSelectedConv } = trpc.chat.getConversationById.useQuery(
    { conversationId: selectedConvId! },
    {
      enabled: !!selectedConvId && !!user,
    }
  );

  // Atualizar mensagens quando conversa selecionada carregar
  useEffect(() => {
    if (selectedConvData && selectedConvId) {
      setMessages(selectedConvData.messages);
      setSelectedConvId(null); // Reset após carregar
    }
  }, [selectedConvData, selectedConvId]);

  const createConversationMutation = trpc.chat.createConversation.useMutation({
    onSuccess: (data) => {
      setConversationId(data.id);
      setMessages([]);
      refetchConversations();
      toast.success("Nova conversa iniciada!");
    },
  });

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, createdAt: new Date() },
      ]);
      // Refetch conversations to get updated title
      setTimeout(() => refetchConversations(), 1000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteConversationMutation = trpc.chat.deleteConversation.useMutation({
    onSuccess: () => {
      toast.success("Conversa apagada!");
      refetchConversations();
      // Se a conversa deletada era a ativa, limpar
      if (conversationId) {
        setConversationId(null);
        setMessages([]);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao apagar conversa");
    },
  });

  const deleteAllConversationsMutation = trpc.chat.deleteAllConversations.useMutation({
    onSuccess: () => {
      toast.success("Todo o histórico foi apagado!");
      refetchConversations();
      setConversationId(null);
      setMessages([]);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao apagar histórico");
    },
  });

  useEffect(() => {
    // Só atualiza se não estiver carregando uma conversa específica
    if (activeData && !selectedConvId) {
      setConversationId(activeData.conversation.id);
      setMessages(activeData.messages);
    }
  }, [activeData, selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Verificar limite de perguntas (plano gratuito)
    if (isAtLimit) {
      toast.error("Limite de perguntas atingido", {
        description: "Faça upgrade do seu plano para continuar fazendo perguntas.",
        action: {
          label: "Ver Planos",
          onClick: () => setLocation("/planos"),
        },
      });
      return;
    }

    // Bloquear envio se não houver conversa ativa
    if (!conversationId) {
      toast.error("Crie uma nova conversa primeiro!");
      return;
    }

    const userMessage = { role: "user", content: message, createdAt: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    sendMessageMutation.mutate({
      conversationId,
      message: message.trim(),
    });
  };

  const handleNewConversation = () => {
    // Verificar se o modo está disponível no plano
    if (!isModeAvailable(mode)) {
      toast.error("Modo não disponível no seu plano", {
        description: "Faça upgrade para desbloquear este modo de aprendizagem.",
        action: {
          label: "Ver Planos",
          onClick: () => setLocation("/planos"),
        },
      });
      return;
    }
    createConversationMutation.mutate({ mode: mode as any });
  };

  const handleModeChange = (newMode: string) => {
    if (!isModeAvailable(newMode)) {
      toast.error("Modo bloqueado", {
        description: `Este modo está disponível apenas nos planos premium.`,
        action: {
          label: "Fazer Upgrade",
          onClick: () => setLocation("/planos"),
        },
      });
      return;
    }
    setMode(newMode);
  };

  const handleSelectConversation = (convId: number) => {
    setConversationId(convId);
    const conv = conversationsList?.find(c => c.id === convId);
    if (conv) {
      setMode(conv.mode);
      // Trigger query to load conversation
      setSelectedConvId(convId);
    }
    // Fechar sidebar no mobile após selecionar
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (convId: number) => {
    if (confirm("Tem certeza que deseja apagar esta conversa?")) {
      deleteConversationMutation.mutate({ conversationId: convId });
    }
  };

  const handleDeleteAllConversations = () => {
    if (confirm("Tem certeza que deseja apagar todo o histórico de conversas? Esta ação não pode ser desfeita.")) {
      deleteAllConversationsMutation.mutate();
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (loadingActive) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentMode = MODES.find((m) => m.value === mode);
  const ModeIcon = currentMode?.icon || Brain;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay backdrop - FORA da sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Mobile overlay, Desktop normal */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between border-b border-gray-200 px-4">
          <img
            src={APP_LOGO}
            alt="Genius"
            className="h-12 cursor-pointer transition-transform hover:scale-105"
            onClick={() => setLocation("/")}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* New Conversation Button */}
        <div className="p-4 space-y-2">
          <Button
            onClick={handleNewConversation}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={createConversationMutation.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Conversa
          </Button>
          
          {conversationsList && conversationsList.length > 0 && (
            <Button
              onClick={handleDeleteAllConversations}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={deleteAllConversationsMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Apagar Histórico
            </Button>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2">
          <div className="space-y-1">
            {conversationsList?.map((conv) => {
              const convMode = MODES.find(m => m.value === conv.mode);
              const ConvIcon = convMode?.icon || MessageSquare;
              const isActive = conv.id === conversationId;
              
              return (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={isActive}
                  icon={ConvIcon}
                  onSelect={() => handleSelectConversation(conv.id)}
                  onTitleUpdate={() => refetchConversations()}
                  onDelete={() => handleDeleteConversation(conv.id)}
                />
              );
            })}
          </div>
        </div>

        {/* User Menu */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {subscriptionData?.plan === "free" ? "Plano Gratuito" : `Plano ${subscriptionData?.plan}`}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="w-full"
            >
              Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Hamburger menu - sempre visível no mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ModeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{currentMode?.label}</h1>
                <p className="text-sm text-gray-500">{currentMode?.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Contador de perguntas removido - chat agora é ilimitado */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="hidden sm:flex"
            >
              Dashboard
            </Button>
            <PlanBadge plan={userPlan} size="sm" />
            <Select value={mode} onValueChange={handleModeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Modo" />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const available = isModeAvailable(m.value);
                  return (
                    <SelectItem 
                      key={m.value} 
                      value={m.value}
                      disabled={!available}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{m.label}</span>
                        {!available && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {!conversationId ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Nenhuma conversa ativa
              </h2>
              <p className="max-w-md text-gray-600 mb-6">
                Clique em <strong>"Nova Conversa"</strong> na barra lateral para começar, ou escolha uma conversa do histórico.
              </p>
              <Button
                onClick={handleNewConversation}
                className="bg-primary hover:bg-primary/90"
                disabled={createConversationMutation.isPending}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Nova Conversa
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <ModeIcon className="h-12 w-12 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Olá! Como posso ajudar-te hoje?
              </h2>
              <p className="max-w-md text-gray-600">
                Faz uma pergunta ou partilha uma dúvida. Vou guiar-te passo a passo até dominares o conceito.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
                    style={msg.role === "assistant" ? { fontFamily: "'Crimson Text', serif", fontStyle: "italic" } : {}}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          code: ({ children }) => (
                            <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono text-gray-800">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4 pb-20 lg:p-6 lg:pb-6">
          <div className="mx-auto max-w-3xl">
            {/* Limit Warning for Free Plan */}
            {questionsLimit !== null && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">
                    Perguntas este mês: {questionsUsed} / {questionsLimit}
                  </span>
                  {questionsUsed >= questionsLimit * 0.8 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-teal-600"
                      onClick={() => setLocation("/planos")}
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Fazer Upgrade
                    </Button>
                  )}
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isAtLimit
                        ? "bg-red-500"
                        : questionsUsed >= questionsLimit * 0.8
                        ? "bg-orange-500"
                        : "bg-teal-500"
                    }`}
                    style={{ width: `${Math.min((questionsUsed / questionsLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder={
                  isAtLimit
                    ? "Limite atingido - Faça upgrade para continuar"
                    : conversationId
                    ? "Escreve a tua pergunta..."
                    : "Crie uma nova conversa para começar..."
                }
                className="flex-1"
                disabled={!conversationId || sendMessageMutation.isPending || isAtLimit}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!conversationId || !message.trim() || sendMessageMutation.isPending || isAtLimit}
                size="icon"
                className="h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

