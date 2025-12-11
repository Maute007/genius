export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type ConversationMode = 'quick_doubt' | 'exam_prep' | 'revision' | 'free_learning';

export type MessageRole = 'user' | 'assistant';

export interface CreateConversationInput {
  title: string;
  mode: ConversationMode;
}

export interface UpdateConversationInput {
  title?: string;
  mode?: ConversationMode;
}

export interface CreateMessageInput {
  content: string;
  role: MessageRole;
}

export interface UpdateMessageInput {
  content: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  age?: number;
  grade?: string;
  interests?: string;
  province?: string;
  onboardingCompleted?: boolean;
}
