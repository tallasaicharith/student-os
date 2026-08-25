import { ModelConfig, ProviderName } from "./types";

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // ── Google Gemini Models (Primary Default Engine) ──────────────────────────
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash (Google AI Studio)",
    provider: "gemini",
    capabilities: ["FAST", "BALANCED", "VISION"],
    contextWindow: 1048576,
    speed: "Ultra Fast",
    quality: "State-of-the-Art",
    reasoningScore: 10,
    supportsVision: true,
    supportsStreaming: true,
  },
  "gemini-2.5-pro": {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro (Deep Reasoning)",
    provider: "gemini",
    capabilities: ["POWERFUL", "REASONING", "VISION"],
    contextWindow: 2097152,
    speed: "Moderate",
    quality: "State-of-the-Art",
    reasoningScore: 10,
    supportsVision: true,
    supportsStreaming: true,
  },

  // ── OpenAI ChatGPT Models ──────────────────────────────────────────────────
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
};

export const DEFAULT_PROVIDER: ProviderName = (process.env.DEFAULT_AI_PROVIDER as ProviderName) || "gemini";
export const DEFAULT_MODEL: string = process.env.DEFAULT_AI_MODEL || "gemini-2.5-flash";

export function getModelConfig(modelId: string): ModelConfig {
  return (
    MODEL_REGISTRY[modelId] || {
      id: modelId,
      name: modelId,
      provider: DEFAULT_PROVIDER,
      capabilities: ["BALANCED"],
      contextWindow: 1048576,
      speed: "Fast",
      quality: "High",
      reasoningScore: 10,
      supportsVision: true,
      supportsStreaming: true,
    }
  );
}

export function getModelsByProvider(provider: ProviderName): ModelConfig[] {
  return Object.values(MODEL_REGISTRY).filter((m) => m.provider === provider);
}
