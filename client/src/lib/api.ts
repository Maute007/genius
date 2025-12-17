import { trpc } from "./trpc";

export interface Conversation {
  id: number;
  title: string;
  mode: 'quick_doubt' | 'exam_prep' | 'revision' | 'free_learning';
  subject: string | null;
  topic: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  content: string;
  role: 'user' | 'assistant';
  tokens: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  name: string | null;
  email: string | null;
  age: number | null;
  grade: string | null;
  interests: string | null;
  province: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  content: string;
  role: 'assistant';
  tokens: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin" | "super_admin";
  plan?: "free" | "student" | "student_plus" | "family";
  onboardingCompleted?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  message?: string;
}

export interface ValidateResponse {
  valid: boolean;
  user: AuthUser;
  expiresAt?: string;
}

const API_BASE = "/api/trpc";

async function trpcCall<T>(path: string, input: any = null, method: "query" | "mutation" = "query"): Promise<T> {
  const token = localStorage.getItem("genius_token");
  
  const url = method === "query" 
    ? `${API_BASE}/${path}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`
    : `${API_BASE}/${path}`;
  
  const options: RequestInit = {
    method: method === "query" ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  
  if (method === "mutation" && input !== null) {
    options.body = JSON.stringify({ json: input });
  }
  
  const response = await fetch(url, options);
  const json = await response.json();
  
  if (json.error) {
    const errorMessage = json.error.message || json.error.json?.message || "Request failed";
    throw new Error(errorMessage);
  }
  
  return json.result?.data?.json as T;
}

export const api = {
  auth: {
    login: async (identifier: string, password: string): Promise<AuthResponse> => {
      return trpcCall<AuthResponse>("auth.login", { identifier, password }, "mutation");
    },
    
    register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
      return trpcCall<AuthResponse>("auth.register", { 
        email, 
        password, 
        name: name || email.split("@")[0] 
      }, "mutation");
    },
    
    logout: async () => {
      return trpcCall("auth.logout", null, "mutation");
    },
    
    validate: async (): Promise<ValidateResponse> => {
      const token = localStorage.getItem("genius_token");
      if (!token) {
        return { valid: false, user: { id: "", name: "", email: "" } };
      }
      
      try {
        const result = await trpcCall<{ valid: boolean; user: any }>(
          "auth.verifyToken", 
          { token }, 
          "query"
        );
        
        if (!result.valid || !result.user) {
          return { valid: false, user: { id: "", name: "", email: "" } };
        }
        
        const profile = await trpcCall<any>("profile.get", null, "query").catch(() => null);
        
        return {
          valid: true,
          user: {
            id: String(result.user.id),
            name: result.user.name || "",
            email: result.user.email || "",
            role: result.user.role as "user" | "admin" | "super_admin" | undefined,
            plan: result.user.plan as "free" | "student" | "student_plus" | "family" | undefined,
            onboardingCompleted: profile?.onboardingCompleted ?? false,
          },
        };
      } catch {
        return { valid: false, user: { id: "", name: "", email: "" } };
      }
    },
  },

  chat: {
    send: async (
      message: string, 
      conversationId: number
    ) => {
      return trpcCall<{ message: string }>("chat.sendMessage", { 
        message, 
        conversationId 
      }, "mutation");
    },
    
    createConversation: async (mode: string) => {
      return trpcCall("chat.createConversation", { mode }, "mutation");
    },
    
    getConversations: async () => {
      return trpcCall("chat.listConversations", null, "query");
    },
    
    getConversation: async (conversationId: number) => {
      return trpcCall("chat.getConversationById", { conversationId }, "query");
    },
    
    deleteConversation: async (conversationId: number) => {
      return trpcCall("chat.deleteConversation", { conversationId }, "mutation");
    },
    
    deleteAllConversations: async () => {
      return trpcCall("chat.deleteAllConversations", null, "mutation");
    },
  },

  profile: {
    get: async () => {
      return trpcCall("profile.get", null, "query");
    },
    
    update: async (data: any) => {
      return trpcCall("profile.upsert", data, "mutation");
    },
    
    searchSchools: async (query: string) => {
      return trpcCall("profile.searchSchools", { query }, "query");
    },
  },

  subscription: {
    getStatus: async () => {
      return trpcCall("subscription.getStatus", null, "query");
    },
    
    processPayment: async (planId: string, paymentMethod: string, phoneNumber: string) => {
      return trpcCall("subscription.processMockPayment", { 
        planId, 
        paymentMethod, 
        phoneNumber 
      }, "mutation");
    },
  },

  dashboard: {
    getStats: async () => {
      return trpcCall("dashboard.stats", null, "query");
    },
    
    getRecentConversations: async (limit = 10) => {
      return trpcCall("dashboard.recentConversations", { limit }, "query");
    },
    
    getInsights: async () => {
      return trpcCall("dashboard.personalizedInsights", null, "query");
    },
  },
};

export default api;
