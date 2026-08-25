import { ModelConfig, ProviderName } from "./types";

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // ── OpenAI ChatGPT Models (Primary Default Engine) ──────────────────────────
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini (ChatGPT Fast & Smart)",
    provider: "openai",
    capabilities: ["FAST", "BALANCED"],
    contextWindow: 128000,
    speed: "Ultra Fast",
    quality: "High",
    reasoningScore: 9,
    supportsVision: true,
    supportsStreaming: true,
  },
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o (Omni Intelligence)",
    provider: "openai",
    capabilities: ["POWERFUL", "REASONING", "VISION"],
    contextWindow: 128000,
    speed: "Fast",
    quality: "State-of-the-Art",
    reasoningScore: 10,
    supportsVision: true,
    supportsStreaming: true,
  },

  // ── Google Gemini Models ───────────────────────────────────────────────────
  "gemini-2.0-flash": {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash (Next-Gen)",
    provider: "gemini",
    capabilities: ["FAST", "BALANCED", "VISION"],
    contextWindow: 1048576,
    speed: "Ultra Fast",
    quality: "Superior",
    reasoningScore: 9,
    supportsVision: true,
    supportsStreaming: true,
  },
  "gemini-1.5-pro": {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro (Deep Reasoning)",
    provider: "gemini",
    capabilities: ["POWERFUL", "REASONING", "VISION"],
    contextWindow: 2097152,
    speed: "Moderate",
    quality: "State-of-the-Art",
    reasoningScore: 10,
    supportsVision: true,
    supportsStreaming: true,
  },

  // ── Anthropic Claude Models ────────────────────────────────────────────────
  "claude-3-5-sonnet-20241022": {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet (Best Coding)",
    provider: "claude",
    capabilities: ["POWERFUL", "REASONING", "VISION"],
    contextWindow: 200000,
    speed: "Fast",
    quality: "State-of-the-Art",
    reasoningScore: 10,
    supportsVision: true,
    supportsStreaming: true,
  },

  // ── Groq / DeepSeek Models ─────────────────────────────────────────────────
  "llama-3.3-70b-versatile": {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B (Groq Ultra-Fast)",
    provider: "groq",
    capabilities: ["FAST", "BALANCED", "REASONING"],
    contextWindow: 128000,
    speed: "Ultra Fast",
    quality: "Superior",
    reasoningScore: 9,
    supportsVision: false,
    supportsStreaming: true,
  },
};

export const DEFAULT_PROVIDER: ProviderName = (process.env.DEFAULT_AI_PROVIDER as ProviderName) || "openai";
export const DEFAULT_MODEL: string = process.env.DEFAULT_AI_MODEL || "gpt-4o-mini";

export function getModelConfig(modelId: string): ModelConfig {
  return (
    MODEL_REGISTRY[modelId] || {
      id: modelId,
      name: modelId,
      provider: DEFAULT_PROVIDER,
      capabilities: ["BALANCED"],
      contextWindow: 128000,
      speed: "Fast",
      quality: "High",
      reasoningScore: 9,
      supportsVision: true,
      supportsStreaming: true,
    }
  );
}

export function getModelsByProvider(provider: ProviderName): ModelConfig[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.provider === provider);
}
