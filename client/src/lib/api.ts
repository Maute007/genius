const API_BASE_URL = '/api/v1';
const API_KEY = 'genius-api-key-2024';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('genius_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json: ApiResponse<T> = await response.json();
  
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  
  return json.data as T;
}

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

export const api = {
  chat: {
    send: (
      message: string, 
      mode: string, 
      history: Array<{ role: string; content: string }> = [],
      userProfile?: { name?: string; age?: number; grade?: string; interests?: string; province?: string }
    ) =>
      request<ChatResponse>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, mode, history, userProfile }),
      }),
  },

  conversations: {
    list: () => request<Conversation[]>('/conversations'),
    
    get: (id: number) => request<Conversation>(`/conversations/${id}`),
    
    create: (data: { title: string; mode: string }) =>
      request<Conversation>('/conversations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: number, data: { title?: string; mode?: string }) =>
      request<Conversation>(`/conversations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: number) =>
      request<{ message: string }>(`/conversations/${id}`, {
        method: 'DELETE',
      }),
  },

  messages: {
    list: (conversationId: number) =>
      request<Message[]>(`/conversations/${conversationId}/messages`),
    
    create: (conversationId: number, data: { content: string; role: string }) =>
      request<Message>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (conversationId: number, messageId: number, data: { content: string }) =>
      request<Message>(`/conversations/${conversationId}/messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (conversationId: number, messageId: number) =>
      request<{ message: string }>(`/conversations/${conversationId}/messages/${messageId}`, {
        method: 'DELETE',
      }),
  },

  profiles: {
    get: (userId: number) => request<Profile>(`/profiles/${userId}`),
    
    update: (userId: number, data: { 
      name?: string; 
      email?: string;
      age?: number;
      grade?: string;
      interests?: string;
      province?: string;
      onboardingCompleted?: boolean;
    }) =>
      request<Profile>(`/profiles/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};

export default api;
