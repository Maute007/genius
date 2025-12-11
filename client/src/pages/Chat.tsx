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
import { Brain, Send, Loader2, Menu, LogOut, User, Zap, BookOpen, RotateCcw, Sparkles, Plus, MessageSquare, X, Trash2 } from "lucide-react";
import { api, Conversation, Message } from "@/lib/api";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MODES = [
  { value: "quick_doubt", label: "Dúvida Rápida", icon: Zap, description: "Resposta focada" },
  { value: "exam_prep", label: "Preparação Exame", icon: BookOpen, description: "Estudo profundo" },
  { value: "revision", label: "Revisão", icon: RotateCcw, description: "Rever tópicos" },
  { value: "free_learning", label: "Aprendizagem Livre", icon: Sparkles, description: "Explorar" },
];

function ConversationItem({
  conversation,
  isActive,
  icon: Icon,
  onSelect,
  onTitleUpdate,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  icon: any;
  onSelect: () => void;
  onTitleUpdate: () => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversation.title || "");
  const [showDelete, setShowDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveTitle = async () => {
    if (editedTitle.trim() && editedTitle !== conversation.title) {
      setIsSaving(true);
      try {
        await api.conversations.update(conversation.id, { title: editedTitle.trim() });
        setIsEditing(false);
        onTitleUpdate();
        toast.success("Título atualizado!");
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsSaving(false);
      }
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
              disabled={isSaving}
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

      const aiResponse = await api.chat.send(userContent, mode, history, userProfile);

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
        await loadConversations();
        if (conversationId === convId) {
          setConversationId(null);
          setMessages([]);
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentMode = MODES.find((m) => m.value === mode);
  const ModeIcon = currentMode?.icon || Brain;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0`}
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

        <div className="flex-1 overflow-y-auto px-2">
          <div className="space-y-1">
            {conversations.map((conv) => {
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
                  onTitleUpdate={() => loadConversations()}
                  onDelete={() => handleDeleteConversation(conv.id)}
                />
              );
            })}
          </div>
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
      </div>

      <div className="flex flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="hidden sm:flex"
            >
              Dashboard
            </Button>
            <Select value={mode} onValueChange={handleModeChange}>
              <SelectTrigger className="w-[180px]">
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
                disabled={creating}
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
                  key={msg.id || i}
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
                          pre: ({ children }) => (
                            <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 my-4">
                              {children}
                            </blockquote>
                          ),
                          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-gray-900">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-gray-900">{children}</h3>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-4 justify-start">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4">
                    <p className="text-gray-500">A pensar...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {conversationId && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="mx-auto flex max-w-3xl gap-4">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreve a tua pergunta..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
                className="bg-primary hover:bg-primary/90"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
