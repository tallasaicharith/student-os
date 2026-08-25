import { AIProvider, ProviderName } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GroqProvider } from "./providers/groq";
import { DEFAULT_MODEL, DEFAULT_PROVIDER, getModelConfig } from "./models.config";

export class AIRegistry {
  private static instance: AIRegistry;
  private providers: Map<ProviderName, AIProvider> = new Map();

  private constructor() {
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new AnthropicProvider());
    this.registerProvider(new GroqProvider());
  }

  public static getInstance(): AIRegistry {
    if (!AIRegistry.instance) {
      AIRegistry.instance = new AIRegistry();
    }
    return AIRegistry.instance;
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  public getProvider(name: ProviderName): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      // Fallback to Gemini if requested provider is unknown
      return this.providers.get("gemini") || new GeminiProvider();
    }
    return provider;
  }

  /**
   * Smart Model Routing based on prompt intent if auto-routing is enabled
   */
  public routeModel(prompt: string, mode: string, currentProvider: ProviderName, currentModel: string): {
    provider: ProviderName;
    model: string;
  } {
    const lower = prompt.toLowerCase();

    // If user explicitly chose a model, respect choice
    if (currentModel && currentModel !== "auto") {
      return { provider: currentProvider, model: currentModel };
    }

    if (mode === "code_review" || lower.includes("code") || lower.includes("bug") || lower.includes("function")) {
      return { provider: "claude", model: "claude-3-5-sonnet-20241022" };
    }

    if (mode === "explain" || lower.includes("why") || lower.includes("explain") || lower.includes("math") || lower.includes("proof")) {
      return { provider: "gemini", model: "gemini-1.5-pro" };
    }

    return { provider: DEFAULT_PROVIDER, model: DEFAULT_MODEL };
  }

  /**
   * Safe Fallback Policy: Returns array of fallback providers in priority order
   */
  public getFallbackProviders(primary: ProviderName): ProviderName[] {
    const fallbacks: ProviderName[] = ["gemini", "openai", "groq", "claude"];
    return fallbacks.filter((p) => p !== primary);
  }
}

export const aiRegistry = AIRegistry.getInstance();
