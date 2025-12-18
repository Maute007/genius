import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Send, Loader2, Menu, LogOut, User, Zap, BookOpen, RotateCcw, Sparkles, Plus, MessageSquare, X, Trash2, Copy, Check, LayoutDashboard } from "lucide-react";
import { api, Conversation, Message } from "@/lib/api";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from "framer-motion";

const MODES = [
  { value: "quick_doubt", label: "Dúvida Rápida", icon: Zap, description: "Resposta focada" },
  { value: "exam_prep", label: "Preparação Exame", icon: BookOpen, description: "Estudo profundo" },
  { value: "revision", label: "Revisão", icon: RotateCcw, description: "Rever tópicos" },
  { value: "free_learning", label: "Aprendizagem Livre", icon: Sparkles, description: "Explorar" },
];

const MODE_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  quick_doubt: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", gradient: "from-amber-500 to-orange-500" },
  exam_prep: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", gradient: "from-blue-500 to-indigo-500" },
  revision: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", gradient: "from-emerald-500 to-teal-500" },
  free_learning: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", gradient: "from-purple-500 to-pink-500" },
};

function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div
      key={msg.id || index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group flex gap-2 sm:gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
    >
      {msg.role === "assistant" && (
        <motion.div 
          className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </motion.div>
      )}
      <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3 ${
            msg.role === "user"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-white border border-gray-200 text-gray-900 shadow-sm"
          }`}
        >
          {msg.role === "assistant" ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-sm sm:text-base">{children}</p>,
                strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1.5 text-sm sm:text-base">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1.5 text-sm sm:text-base">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ children }) => (
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs sm:text-sm font-mono text-gray-800">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="mb-3 overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs sm:text-sm text-gray-100">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-3 italic text-gray-700 my-3 text-sm">
                    {children}
                  </blockquote>
                ),
                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-gray-900">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-gray-900">{children}</h3>,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          ) : (
            <p className="leading-relaxed text-sm sm:text-base">{msg.content}</p>
          )}
        </div>
        <div className={`flex items-center gap-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
            title="Copiar"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      {msg.role === "user" && (
        <motion.div 
          className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: {
  conversation: Conversation & { firstMessagePreview?: string | null };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  
  const mode = MODES.find(m => m.value === conversation.mode);
  const ModeIcon = mode?.icon || MessageSquare;
  const modeColors = MODE_COLORS[conversation.mode] || MODE_COLORS.quick_doubt;
  
  const displayTitle = conversation.firstMessagePreview 
    ? (conversation.firstMessagePreview.length > 45 
        ? conversation.firstMessagePreview.slice(0, 45) + "..." 
        : conversation.firstMessagePreview)
    : "Nova conversa";
    
  const displayDate = new Date(conversation.createdAt).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });

  const timeAgo = () => {
    const now = new Date();
    const created = new Date(conversation.updatedAt || conversation.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full rounded-xl overflow-hidden transition-all duration-200 cursor-pointer group ${
        isActive
          ? "bg-gradient-to-r from-primary/10 to-primary/5 ring-2 ring-primary/30 shadow-lg shadow-primary/10"
          : "bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-md"
      }`}
      onClick={onSelect}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/60" />
      )}
      
      <div className="p-3 pl-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${modeColors.gradient} shadow-lg`}>
            <ModeIcon className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm font-medium leading-tight line-clamp-2 ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                {displayTitle}
              </p>
              <span className="flex-shrink-0 text-[10px] text-gray-400 font-medium">
                {timeAgo()}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${modeColors.bg} ${modeColors.text} border ${modeColors.border}`}>
                <ModeIcon className="h-2.5 w-2.5" />
                {mode?.label || "Chat"}
              </span>
              <span className="text-[10px] text-gray-400">
                {displayDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-all shadow-sm"
            title="Apagar conversa"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const { user, logout } = useGeniusAuth();
  const [mode, setMode] = useState<string>("quick_doubt");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadConversations = async () => {
    try {
      const data = await api.conversations.list();
      setConversations(data);
    } catch (error: any) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const data = await api.messages.list(convId);
      setMessages(data);
    } catch (error: any) {
      console.error("Failed to load messages:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadConversations();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId) return;

    const userContent = message.trim();
    const userMessage: Message = {
      id: Date.now(),
      conversationId,
      content: userContent,
      role: "user",
      tokens: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setSending(true);

    try {
      await api.messages.create(conversationId, {
        content: userContent,
        role: "user",
      });

      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const userProfile = user ? {
        name: user.name,
        age: user.age,
        grade: user.grade,
        interests: user.interests,
        province: user.province,
      } : undefined;

      const aiResponse = await api.chat.send(userContent, conversationId, history, userProfile);

      await api.messages.create(conversationId, {
        content: aiResponse.content,
        role: "assistant",
      });

      await loadMessages(conversationId);
    } catch (error: any) {
      toast.error(error.message || "Erro ao obter resposta da IA");
    } finally {
      setSending(false);
    }
  };

  const handleNewConversation = async () => {
    setCreating(true);
    try {
      const newConv = await api.conversations.create({
        title: "Nova Conversa",
        mode: mode,
      });
      setConversationId(newConv.id);
      setMessages([]);
      await loadConversations();
      toast.success("Nova conversa iniciada!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
  };

  const handleSelectConversation = async (convId: number) => {
    setConversationId(convId);
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setMode(conv.mode);
    }
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async (convId: number) => {
    if (confirm("Tem certeza que deseja apagar esta conversa?")) {
      try {
        await api.conversations.delete(convId);
        toast.success("Conversa apagada!");
        
        const remainingConversations = conversations.filter(c => c.id !== convId);
        setConversations(remainingConversations);
        
        if (conversationId === convId) {
          if (remainingConversations.length > 0) {
            const nextConv = remainingConversations[0];
            setConversationId(nextConv.id);
            setMode(nextConv.mode);
          } else {
            setConversationId(null);
            setMessages([]);
          }
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleDeleteAllConversations = async () => {
    if (confirm("Tem certeza que deseja apagar todo o histórico de conversas?")) {
      try {
        for (const conv of conversations) {
          await api.conversations.delete(conv.id);
        }
        toast.success("Todo o histórico foi apagado!");
        setConversations([]);
        setConversationId(null);
        setMessages([]);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-10 w-10 text-primary" />
          </motion.div>
          <p className="text-sm text-gray-500">A carregar...</p>
        </motion.div>
      </div>
    );
  }

  const currentMode = MODES.find((m) => m.value === mode);
  const ModeIcon = currentMode?.icon || Brain;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-gray-50">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed lg:relative inset-y-0 left-0 z-50 w-72 lg:w-64 flex flex-col border-r border-gray-200 bg-white lg:translate-x-0"
      >
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

        <div className="p-4 space-y-2">
          <Button
            onClick={handleNewConversation}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={creating}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Conversa
          </Button>
          
          {conversations.length > 0 && (
            <Button
              onClick={handleDeleteAllConversations}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Apagar Histórico
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {conversations.map((conv) => {
                const isActive = conv.id === conversationId;
                
                return (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv as any}
                    isActive={isActive}
                    onSelect={() => handleSelectConversation(conv.id)}
                    onDelete={() => handleDeleteConversation(conv.id)}
                  />
                );
              })}
            </div>
          </AnimatePresence>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "Estudante"}</p>
              <p className="text-xs text-gray-500">Plano Gratuito</p>
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
      </motion.div>

      <div className="flex flex-1 flex-col pb-16 lg:pb-0">
        <header className="flex h-14 lg:h-20 items-center justify-between border-b border-gray-200 bg-white px-3 lg:px-6 safe-area-top">
          <div className="flex items-center gap-2 lg:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden h-9 w-9"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <motion.div 
              className="flex items-center gap-2 lg:gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className={`flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-gradient-to-br ${MODE_COLORS[mode]?.gradient || 'from-primary to-teal-400'} shadow-lg`}>
                <ModeIcon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base lg:text-lg font-semibold text-gray-900">{currentMode?.label}</h1>
                <p className="text-xs lg:text-sm text-gray-500">{currentMode?.description}</p>
              </div>
              <span className="sm:hidden text-sm font-semibold text-gray-900">{currentMode?.label}</span>
            </motion.div>
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="hidden sm:flex"
            >
              Dashboard
            </Button>
            <Select value={mode} onValueChange={handleModeChange}>
              <SelectTrigger className="w-[140px] lg:w-[180px] h-9 text-xs lg:text-sm">
                <SelectValue placeholder="Modo" />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((m) => {
                  const Icon = m.icon;
                  return (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{m.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 lg:p-6 pb-20 lg:pb-6">
          {!conversationId ? (
            <motion.div 
              className="flex h-full flex-col items-center justify-center text-center px-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="mb-6 flex h-20 w-20 lg:h-24 lg:w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-teal-400 shadow-xl shadow-primary/30"
                animate={{ 
                  boxShadow: ["0 10px 40px rgba(20, 184, 166, 0.3)", "0 15px 50px rgba(20, 184, 166, 0.5)", "0 10px 40px rgba(20, 184, 166, 0.3)"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <MessageSquare className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
              </motion.div>
              <h2 className="mb-2 text-xl lg:text-2xl font-bold text-gray-900 font-['Playfair_Display']">
                Pronto para aprender?
              </h2>
              <p className="max-w-md text-sm lg:text-base text-gray-600 mb-6">
                Toca no <strong className="text-primary">+</strong> para iniciar uma nova conversa com o teu tutor
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleNewConversation}
                  className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 px-6"
                  disabled={creating}
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Conversa
                </Button>
              </motion.div>
              
              <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const colors = MODE_COLORS[m.value];
                  return (
                    <motion.button
                      key={m.value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setMode(m.value); handleNewConversation(); }}
                      className={`p-3 rounded-xl border ${colors.border} ${colors.bg} text-left transition-all`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-2`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <p className={`text-xs font-semibold ${colors.text}`}>{m.label}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : messages.length === 0 ? (
            <motion.div 
              className="flex h-full flex-col items-center justify-center text-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div 
                className={`mb-6 flex h-20 w-20 lg:h-24 lg:w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${MODE_COLORS[mode]?.gradient || 'from-primary to-teal-400'} shadow-xl`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <ModeIcon className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
              </motion.div>
              <h2 className="mb-2 text-xl lg:text-2xl font-bold text-gray-900 font-['Playfair_Display']">
                Olá! Como posso ajudar?
              </h2>
              <p className="max-w-md text-sm lg:text-base text-gray-600">
                Escreve a tua dúvida em baixo. Vou guiar-te passo a passo!
              </p>
              
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["Explica-me...", "Como resolver...", "O que é..."].map((hint, i) => (
                  <motion.button
                    key={hint}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    onClick={() => setMessage(hint)}
                    className="px-3 py-1.5 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {hint}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-3 sm:space-y-5">
              {messages.map((msg, i) => (
                <MessageBubble key={msg.id || i} msg={msg} index={i} />
              ))}
              <AnimatePresence>
                {sending && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-2 sm:gap-4 justify-start"
                  >
                    <motion.div 
                      className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary" />
                    </motion.div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <motion.span
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <AnimatePresence>
          {conversationId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="border-t border-gray-200 bg-white/95 backdrop-blur-lg p-3 sm:p-4"
            >
              <div className="mx-auto flex max-w-3xl gap-2 sm:gap-3">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreve a tua pergunta..."
                  className="flex-1 h-11 sm:h-12 text-sm sm:text-base rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sending}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                    className="bg-gradient-to-r from-primary to-teal-400 hover:from-primary/90 hover:to-teal-400/90 h-11 w-11 sm:h-12 sm:w-12 p-0 shadow-lg shadow-primary/30 rounded-xl"
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!conversationId && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNewConversation}
            disabled={creating}
            className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-400 text-white shadow-xl shadow-primary/40 flex items-center justify-center z-30"
          >
            {creating ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </motion.button>
        )}
      </div>
      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-area-bottom z-20">
        <div className="flex items-center justify-around max-w-md mx-auto py-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setLocation("/dashboard")}
            className="flex flex-col items-center gap-0.5 py-2 px-3 text-gray-500 hover:text-primary transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-medium">Painel</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 py-2 px-3 text-gray-500 hover:text-primary transition-colors"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-[10px] font-medium">Conversas</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleNewConversation}
            disabled={creating}
            className="flex flex-col items-center gap-0.5 py-2 px-3"
          >
            <div className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-white">
              {creating ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Plus className="h-5 w-5 text-white" />
              )}
            </div>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const modes = ["quick_doubt", "exam_prep", "revision", "free_learning"];
              const currentIndex = modes.indexOf(mode);
              const nextIndex = (currentIndex + 1) % modes.length;
              setMode(modes[nextIndex]);
              toast.success(`Modo: ${MODES.find(m => m.value === modes[nextIndex])?.label}`);
            }}
            className="flex flex-col items-center gap-0.5 py-2 px-3 text-gray-500 hover:text-primary transition-colors"
          >
            {(() => {
              const ModeIcon = MODES.find(m => m.value === mode)?.icon || Zap;
              return <ModeIcon className="h-5 w-5" />;
            })()}
            <span className="text-[10px] font-medium">Modo</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
