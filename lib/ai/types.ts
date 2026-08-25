export type ProviderName = "gemini" | "openai" | "claude" | "groq" | "deepseek";

export type ModelCapability = "FAST" | "BALANCED" | "POWERFUL" | "REASONING" | "VISION";

export interface ModelConfig {
  id: string;
  name: string;
  provider: ProviderName;
  capabilities: ModelCapability[];
  contextWindow: number; // in tokens
  speed: "Ultra Fast" | "Fast" | "Moderate" | "Deep";
  quality: "Good" | "High" | "Superior" | "State-of-the-Art";
  reasoningScore: number; // 1-10 scale
  supportsVision: boolean;
  supportsStreaming: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: { name: string; type: string; url?: string; content?: string }[];
}

export interface StreamRequest {
  provider: ProviderName;
  model: string;
  messages: ChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  apiKey?: string;
}

export interface AIResponse {
  content: string;
  provider: ProviderName;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
}

export type AIErrorCode =
  | "INVALID_API_KEY"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "MODEL_NOT_FOUND"
  | "CONTEXT_TOO_LARGE"
  | "CONTENT_REJECTED"
  | "TIMEOUT"
  | "CONFIGURATION_ERROR"
  | "UNKNOWN_ERROR";

export class AIProviderError extends Error {
  constructor(
    public code: AIErrorCode,
    public provider: ProviderName,
    public userMessage: string,
    public originalError?: unknown
  ) {
    super(userMessage);
    this.name = "AIProviderError";
  }
}

export interface AIProvider {
  name: ProviderName;
  stream(req: StreamRequest): Promise<ReadableStream<Uint8Array>>;
  generate(req: StreamRequest): Promise<AIResponse>;
  testConnection(apiKey?: string): Promise<{ success: boolean; message: string }>;
}
