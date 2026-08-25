import { AIProvider, ProviderName } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { DEFAULT_MODEL, DEFAULT_PROVIDER } from "./models.config";

export class AIRegistry {
  private static instance: AIRegistry;
  private providers: Map<ProviderName, AIProvider> = new Map();

  private constructor() {
    this.registerProvider(new GeminiProvider());
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
      return this.providers.get("gemini") || new GeminiProvider();
    }
    return provider;
  }

  /**
   * Smart Model Routing: Always routes to 100% Working Google Gemini 2.5 Flash
   */
  public routeModel(prompt: string, mode: string, currentProvider: ProviderName, currentModel: string): {
    provider: ProviderName;
    model: string;
  } {
    return { provider: "gemini", model: "gemini-2.5-flash" };
  }

  /**
   * Safe Fallback Policy
   */
  public getFallbackProviders(primary: ProviderName): ProviderName[] {
    return ["gemini"];
  }
}

export const aiRegistry = AIRegistry.getInstance();
