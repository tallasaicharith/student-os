import { AIProvider, AIResponse, StreamRequest } from "../types";

export class GeminiProvider implements AIProvider {
  name = "gemini" as const;

  private getApiKey(reqKey?: string): string {
    const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    let key = reqKey;
    
    // If request key is missing, empty, or starts with OpenAI's sk- prefix, fallback to environment variable
    if (!key || key.startsWith("sk-") || key.trim().length === 0) {
      key = envKey;
    }

    if (!key || key.trim().length === 0) {
      throw new Error("Gemini API key is not configured. Add GEMINI_API_KEY to your server environment.");
    }

    return key.trim();
  }

  private parseError(status: number, errText: string): Error {
    if (status === 401 || status === 403 || errText.includes("API_KEY_INVALID") || errText.includes("UNAUTHENTICATED")) {
      return new Error("Invalid Gemini API key. Please verify your GEMINI_API_KEY in server configuration.");
    }
    if (status === 404 || errText.includes("NOT_FOUND")) {
      return new Error("Configured Gemini model is unavailable or non-existent.");
    }
    if (status === 429 || errText.includes("RESOURCE_EXHAUSTED")) {
      return new Error("Gemini API rate limit exceeded. Please try again in a few moments.");
    }
    return new Error(`Gemini API error (${status}): ${errText}`);
  }

  async stream(req: StreamRequest): Promise<ReadableStream<Uint8Array>> {
    const apiKey = this.getApiKey(req.apiKey);
    const model = req.model && req.model !== "gpt-4o-mini" ? req.model : "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const contents = req.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || " " }],
    }));

    const payload: any = { contents };

    if (req.systemPrompt) {
      payload.system_instruction = {
        parts: [{ text: req.systemPrompt }],
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw this.parseError(res.status, errText);
    }

    if (!res.body) {
      throw new Error("Gemini API returned empty response body");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = res.body.getReader();

    return new ReadableStream({
      async start(controller) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.replace("data: ", "").trim();
              if (!jsonStr) continue;
              try {
                const data = JSON.parse(jsonStr);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) controller.enqueue(encoder.encode(text));
              } catch (_e) {}
            }
          }
        }
        controller.close();
      },
    });
  }

  async generate(req: StreamRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const apiKey = this.getApiKey(req.apiKey);
    const model = req.model && req.model !== "gpt-4o-mini" ? req.model : "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = req.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || " " }],
    }));

    const payload: any = { contents };

    if (req.systemPrompt) {
      payload.system_instruction = {
        parts: [{ text: req.systemPrompt }],
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw this.parseError(res.status, errText);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      content: text,
      provider: "gemini",
      model,
      latencyMs: Date.now() - startTime,
    };
  }

  async testConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
    try {
      const key = this.getApiKey(apiKey);
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        {
          headers: { "x-goog-api-key": key },
        }
      );

      if (listRes.ok) {
        return { success: true, message: "Connected to Google Gemini API" };
      }

      const errData = await listRes.json().catch(() => ({}));
      const errMsg = errData.error?.message || `Status ${listRes.status}`;
      return { success: false, message: `Gemini API Key Error: ${errMsg}` };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Connection failed" };
    }
  }
}
