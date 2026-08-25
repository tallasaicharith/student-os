import { ModelConfig, ProviderName } from "./types";

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // ── 100% Working Google AI Studio Gemini Models ─────────────────────────────
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    name: "Google Gemini 2.5 Flash (Live / Fast)",
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
    name: "Google Gemini 2.5 Pro (Deep Reasoning)",
    provider: "gemini",
    capabilities: ["POWERFUL", "REASONING", "VISION"],
    contextWindow: 2097152,
    speed: "Moderate",
    quality: "State-of-the-Art",
    reasoningScore: 10,
    supportsVision: true,
    supportsStreaming: true,
  },
};

export const DEFAULT_PROVIDER: ProviderName = "gemini";
export const DEFAULT_MODEL: string = "gemini-2.5-flash";

export function getModelConfig(modelId: string): ModelConfig {
  return (
    MODEL_REGISTRY[modelId] || {
      id: "gemini-2.5-flash",
      name: "Google Gemini 2.5 Flash",
      provider: "gemini",
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
