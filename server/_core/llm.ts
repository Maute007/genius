import Anthropic from "@anthropic-ai/sdk";
import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = ENV.claudeApiKey;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

function convertToClaudeMessages(messages: Message[]): { system: string; messages: Anthropic.MessageParam[] } {
  const claudeMessages: Anthropic.MessageParam[] = [];
  let systemMessage = "";

  for (const msg of messages) {
    if (msg.role === "system") {
      const content = Array.isArray(msg.content) 
        ? msg.content.map(c => typeof c === "string" ? c : c.type === "text" ? c.text : "").join("\n")
        : msg.content;
      systemMessage = typeof content === "string" ? content : "";
      continue;
    }

    let content: string | Anthropic.ContentBlockParam[];
    
    if (typeof msg.content === "string") {
      content = msg.content;
    } else if (Array.isArray(msg.content)) {
      content = msg.content.map(part => {
        if (typeof part === "string") return { type: "text" as const, text: part };
        if (part.type === "text") return { type: "text" as const, text: part.text };
        if (part.type === "image_url") {
          const url = part.image_url.url;
          if (url.startsWith("data:")) {
            const match = url.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              return {
                type: "image" as const,
                source: {
                  type: "base64" as const,
                  media_type: match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                  data: match[2],
                },
              };
            }
          }
          return { type: "text" as const, text: `[Image: ${url}]` };
        }
        return { type: "text" as const, text: JSON.stringify(part) };
      });
    } else {
      content = String(msg.content);
    }

    claudeMessages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content,
    });
  }

  return { system: systemMessage, messages: claudeMessages };
}

function convertFromClaudeResponse(claudeResponse: Anthropic.Message): InvokeResult {
  const content = claudeResponse.content
    .map((block) => block.type === "text" ? block.text : "")
    .join("\n");

  return {
    id: claudeResponse.id,
    created: Date.now(),
    model: claudeResponse.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: content,
        },
        finish_reason: claudeResponse.stop_reason,
      },
    ],
    usage: {
      prompt_tokens: claudeResponse.usage?.input_tokens || 0,
      completion_tokens: claudeResponse.usage?.output_tokens || 0,
      total_tokens: (claudeResponse.usage?.input_tokens || 0) + (claudeResponse.usage?.output_tokens || 0),
    },
  };
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const {
    messages,
    maxTokens,
    max_tokens,
  } = params;

  const apiKey = ENV.claudeApiKey;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não está configurada. Por favor, configure a chave de API.");
  }

  try {
    const client = getAnthropicClient();
    const { system, messages: claudeMessages } = convertToClaudeMessages(messages);
    
    console.log("🔵 Calling Claude API with SDK...");
    console.log(`   Model: ${ENV.claudeModel}`);
    console.log(`   Messages: ${claudeMessages.length}`);
    
    const response = await client.messages.create({
      model: ENV.claudeModel,
      max_tokens: maxTokens || max_tokens || 4096,
      system: system || undefined,
      messages: claudeMessages,
    });

    console.log("✅ Claude API response received");
    console.log(`   Stop reason: ${response.stop_reason}`);
    console.log(`   Tokens used: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out`);
    
    return convertFromClaudeResponse(response);
  } catch (error: any) {
    console.error("❌ Claude API error:", error);
    
    if (error.status === 401) {
      throw new Error("Chave de API inválida. Por favor, verifique a ANTHROPIC_API_KEY.");
    }
    if (error.status === 429) {
      throw new Error("Limite de taxa excedido. Por favor, tente novamente em alguns momentos.");
    }
    if (error.status === 500 || error.status === 503) {
      throw new Error("Serviço da Anthropic temporariamente indisponível. Por favor, tente novamente.");
    }
    
    throw new Error(`Erro ao comunicar com a IA: ${error.message || "Erro desconhecido"}`);
  }
}
