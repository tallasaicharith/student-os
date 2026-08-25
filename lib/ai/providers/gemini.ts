import { AIProvider, AIResponse, StreamRequest } from "../types";
import { sanitizeErrorMessage } from "../security";

export class GeminiProvider implements AIProvider {
  name = "gemini" as const;

  private getApiKey(reqKey?: string): string {
    if (reqKey && reqKey.trim().length > 0) {
      return reqKey.trim();
    }
    const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!envKey || envKey.trim().length === 0) {
      throw new Error("Google Gemini API key is missing. Paste your Google AI Studio key (starts with AIza...) in Settings.");
    }
    return envKey.trim();
  }

  async stream(req: StreamRequest): Promise<ReadableStream<Uint8Array>> {
    const apiKey = this.getApiKey(req.apiKey);
    const model = req.model.includes("gemini") ? req.model : "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const contents = req.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    if (req.systemPrompt) {
      contents.unshift({
        role: "user",
        parts: [{ text: `[SYSTEM INSTRUCTIONS]: ${req.systemPrompt}` }],
      });
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (!res.ok) {
        // Retry with gemini-2.0-flash fallback if model was 404
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
        const fallbackRes = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        });

        if (!fallbackRes.ok) {
          const errText = await fallbackRes.text();
          throw new Error(`Gemini API returned ${fallbackRes.status}: ${errText}`);
        }

        if (!fallbackRes.body) throw new Error("Gemini API returned empty response body");

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const reader = fallbackRes.body.getReader();

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
    } catch (err) {
      throw sanitizeErrorMessage(err, "gemini");
    }
  }

  async generate(req: StreamRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const apiKey = this.getApiKey(req.apiKey);
    const model = req.model.includes("gemini") ? req.model : "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = req.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    if (req.systemPrompt) {
      contents.unshift({
        role: "user",
        parts: [{ text: `[SYSTEM INSTRUCTIONS]: ${req.systemPrompt}` }],
      });
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (!res.ok) {
        throw new Error(`Gemini API returned status ${res.status}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return {
        content: text,
        provider: "gemini",
        model,
        latencyMs: Date.now() - startTime,
      };
    } catch (err) {
      throw sanitizeErrorMessage(err, "gemini");
    }
  }

  async testConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
    try {
      const key = this.getApiKey(apiKey);

      // Official ListModels verification endpoint (100% reliable for all Google AI Studio keys)
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
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
