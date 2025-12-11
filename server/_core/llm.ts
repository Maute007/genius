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

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = () => {
  // If Claude API key is configured, use Claude
  if (ENV.claudeApiKey && ENV.claudeApiKey.trim().length > 0) {
    return "https://api.anthropic.com/v1/messages";
  }
  
  // Fallback to Forge API
  return ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";
};

const assertApiKey = () => {
  if (!ENV.claudeApiKey && !ENV.forgeApiKey) {
    throw new Error("Neither CLAUDE_API_KEY nor OPENAI_API_KEY is configured");
  }
  
  // Validate Claude API key format
  if (ENV.claudeApiKey && ENV.claudeApiKey.trim().length > 0) {
    if (!ENV.claudeApiKey.startsWith("sk-ant-")) {
      console.warn("⚠️  CLAUDE_API_KEY doesn't start with 'sk-ant-' - may be invalid");
    }
    console.log(`✅ Using Claude API (model: ${ENV.claudeModel})`);
  } else if (ENV.forgeApiKey) {
    console.log("✅ Using Forge API (fallback)");
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

// Convert OpenAI format messages to Claude format
const convertToClaudeMessages = (messages: Message[]) => {
  const claudeMessages: any[] = [];
  let systemMessage = "";

  for (const msg of messages) {
    if (msg.role === "system") {
      // Claude handles system messages separately
      const content = Array.isArray(msg.content) 
        ? msg.content.map(c => typeof c === "string" ? c : c.type === "text" ? c.text : "").join("\n")
        : msg.content;
      systemMessage = typeof content === "string" ? content : "";
      continue;
    }

    const normalizedMsg = normalizeMessage(msg);
    const content = typeof normalizedMsg.content === "string" 
      ? normalizedMsg.content 
      : Array.isArray(normalizedMsg.content)
        ? normalizedMsg.content.map(part => {
            if (typeof part === "string") return { type: "text", text: part };
            if (part.type === "text") return { type: "text", text: part.text };
            if (part.type === "image_url") {
              // Convert image_url to Claude's format
              const url = part.image_url.url;
              if (url.startsWith("data:")) {
                const [mimeType, base64Data] = url.replace("data:", "").split(";base64,");
                return {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mimeType,
                    data: base64Data,
                  },
                };
              }
              return { type: "text", text: `[Image: ${url}]` };
            }
            return { type: "text", text: JSON.stringify(part) };
          })
        : [{ type: "text", text: String(normalizedMsg.content) }];

    claudeMessages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: typeof content === "string" ? content : content,
    });
  }

  return { system: systemMessage, messages: claudeMessages };
};

// Convert Claude response to OpenAI format
const convertFromClaudeResponse = (claudeResponse: any): InvokeResult => {
  const content = claudeResponse.content
    .map((block: any) => block.type === "text" ? block.text : "")
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
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    maxTokens,
    max_tokens,
  } = params;

  // Check if using Claude API
  const useClaudeApi = ENV.claudeApiKey && ENV.claudeApiKey.trim().length > 0;

  if (useClaudeApi) {
    try {
      // Claude API Implementation
      const { system, messages: claudeMessages } = convertToClaudeMessages(messages);
      
      const payload: Record<string, unknown> = {
        model: ENV.claudeModel,
        max_tokens: maxTokens || max_tokens || 4096,
        messages: claudeMessages,
      };

      if (system) {
        payload.system = system;
      }

      // Claude doesn't support tools in the same way, but we can add them if needed
      // For now, we'll skip tool support for Claude

      console.log("🔵 Calling Claude API...");
      
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

      try {
        const response = await fetch(resolveApiUrl(), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": ENV.claudeApiKey,
            "anthropic-version": ENV.claudeApiVersion,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Claude API Error [${response.status}]:`, errorText);
          throw new Error(
            `Claude API invoke failed: ${response.status} ${response.statusText} – ${errorText}`
          );
        }

        const claudeResponse = await response.json();
        console.log("✅ Claude API response received");
        return convertFromClaudeResponse(claudeResponse);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error("Claude API request timeout after 60 seconds");
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("❌ Claude API fetch error:", error);
      if (error instanceof Error && error.message.includes("fetch failed")) {
        throw new Error(
          `Erro ao conectar com a API do Claude. Verifique sua conexão de internet e se a CLAUDE_API_KEY está correta. Erro original: ${error.message}`
        );
      }
      throw error;
    }
  }

  // Original OpenAI/Forge API Implementation
  const payload: Record<string, unknown> = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens = maxTokens || max_tokens || 32768;
  payload.thinking = {
    budget_tokens: 128,
  };

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}
