import { ModelConfig, ProviderName } from "./types";

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
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
  "gemini-1.5-flash": {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash (Standard)",
    provider: "gemini",
    capabilities: ["FAST", "BALANCED"],
    contextWindow: 1048576,
    speed: "Fast",
    quality: "High",
    reasoningScore: 8,
    supportsVision: true,
    supportsStreaming: true,
  },

  // ── OpenAI Models ──────────────────────────────────────────────────────────
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
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini (Fast & Efficient)",
    provider: "openai",
    capabilities: ["FAST", "BALANCED"],
    contextWindow: 128000,
    speed: "Ultra Fast",
    quality: "High",
    reasoningScore: 8,
    supportsVision: true,
    supportsStreaming: true,
  },
  "o3-mini": {
    id: "o3-mini",
    name: "o3-mini (STEM & Code Reasoning)",
    provider: "openai",
    capabilities: ["REASONING", "POWERFUL"],
    contextWindow: 200000,
    speed: "Moderate",
    quality: "Superior",
    reasoningScore: 10,
    supportsVision: false,
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
  "claude-3-5-haiku-20241022": {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku (Lightning Fast)",
    provider: "claude",
    capabilities: ["FAST", "BALANCED"],
    contextWindow: 200000,
    speed: "Ultra Fast",
    quality: "High",
    reasoningScore: 8,
    supportsVision: false,
    supportsStreaming: true,
  },

  // ── Groq / DeepSeek Open Models ────────────────────────────────────────────
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
  "deepseek-r1": {
    id: "deepseek-r1",
    name: "DeepSeek R1 (Open Reasoning)",
    provider: "deepseek",
    capabilities: ["REASONING", "POWERFUL"],
    contextWindow: 128000,
    speed: "Moderate",
    quality: "State-of-the-Art",
    reasoningScore: 10,
    supportsVision: false,
    supportsStreaming: true,
  },
};

export const DEFAULT_PROVIDER: ProviderName = (process.env.DEFAULT_AI_PROVIDER as ProviderName) || "gemini";
export const DEFAULT_MODEL: string = process.env.DEFAULT_AI_MODEL || "gemini-2.0-flash";

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
      reasoningScore: 8,
      supportsVision: false,
      supportsStreaming: true,
    }
  );
}

export function getModelsByProvider(provider: ProviderName): ModelConfig[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.provider === provider);
}
