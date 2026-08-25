import { AIErrorCode, AIProviderError, ProviderName } from "./types";

export function maskApiKey(key?: string | null): string {
  if (!key || key.trim().length === 0) return "Not Configured";
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `••••••••${trimmed.slice(-4)}`;
}

export function sanitizeErrorMessage(err: unknown, provider: ProviderName): AIProviderError {
  if (err instanceof AIProviderError) {
    return err;
  }

  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  let code: AIErrorCode = "UNKNOWN_ERROR";
  let userMessage = `An unexpected error occurred with ${provider.toUpperCase()}. Please try again.`;

  if (lower.includes("invalid api key") || lower.includes("unauthorized") || lower.includes("401") || lower.includes("key not found")) {
    code = "INVALID_API_KEY";
    userMessage = `${provider.toUpperCase()} API key is invalid or not configured. Add a valid key in Settings.`;
  } else if (lower.includes("rate limit") || lower.includes("quota") || lower.includes("429") || lower.includes("too many requests")) {
    code = "RATE_LIMITED";
    userMessage = `${provider.toUpperCase()} rate limit or quota exceeded. Please wait a moment and try again.`;
  } else if (lower.includes("unavailable") || lower.includes("503") || lower.includes("500") || lower.includes("overloaded")) {
    code = "PROVIDER_UNAVAILABLE";
    userMessage = `${provider.toUpperCase()} is temporarily unavailable. Switched to fallback provider.`;
  } else if (lower.includes("content filter") || lower.includes("safety") || lower.includes("blocked")) {
    code = "CONTENT_REJECTED";
    userMessage = "The request was flagged by content safety policies.";
  } else if (lower.includes("timeout") || lower.includes("timed out")) {
    code = "TIMEOUT";
    userMessage = `The request to ${provider.toUpperCase()} timed out. Please try again.`;
  }

  return new AIProviderError(code, provider, userMessage, err);
}

export function sanitizePromptText(text: string): string {
  if (!text) return "";
  // Strip dangerous prompt injection attempts from retrieved database content
  return text
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/\[system_prompt\]/gi, "")
    .replace(/\[override_instructions\]/gi, "")
    .slice(0, 8000);
}
