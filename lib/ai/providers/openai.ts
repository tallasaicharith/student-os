import { AIProvider, AIResponse, StreamRequest } from "../types";
import { sanitizeErrorMessage } from "../security";

export class OpenAIProvider implements AIProvider {
  name = "openai" as const;

  private getApiKey(reqKey?: string): string {
    const envKey = process.env.OPENAI_API_KEY;
    let key = reqKey;
    if (!key || !key.startsWith("sk-") || key.trim().length === 0) {
      key = envKey;
    }
    if (!key || key.trim().length === 0) {
      throw new Error("OpenAI API key is missing. Add OPENAI_API_KEY in .env or Settings.");
    }
    return key.trim();
  }

  async stream(req: StreamRequest): Promise<ReadableStream<Uint8Array>> {
    const apiKey = this.getApiKey(req.apiKey);
    const model = req.model || "gpt-4o-mini";

    const formattedMessages = req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    if (req.systemPrompt) {
      formattedMessages.unshift({ role: "system", content: req.systemPrompt });
    }

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          messages: formattedMessages,
          temperature: req.temperature ?? 0.7,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI API returned ${res.status}: ${errText}`);
      }

      if (!res.body) {
        throw new Error("OpenAI API returned empty body");
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
                if (jsonStr === "[DONE]") break;
                try {
                  const data = JSON.parse(jsonStr);
                  const text = data.choices?.[0]?.delta?.content;
                  if (text) controller.enqueue(encoder.encode(text));
                } catch (_e) {}
              }
            }
          }
          controller.close();
        },
      });
    } catch (err) {
      throw sanitizeErrorMessage(err, "openai");
    }
  }

  async generate(req: StreamRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const apiKey = this.getApiKey(req.apiKey);
    const model = req.model || "gpt-4o-mini";

    const formattedMessages = req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    if (req.systemPrompt) {
      formattedMessages.unshift({ role: "system", content: req.systemPrompt });
    }

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: req.temperature ?? 0.7,
        }),
      });

      if (!res.ok) throw new Error(`OpenAI API returned status ${res.status}`);

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";

      return {
        content: text,
        provider: "openai",
        model,
        inputTokens: data.usage?.prompt_tokens,
        outputTokens: data.usage?.completion_tokens,
        latencyMs: Date.now() - startTime,
      };
    } catch (err) {
      throw sanitizeErrorMessage(err, "openai");
    }
  }

  async testConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
    try {
      const key = this.getApiKey(apiKey);
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });

      if (res.ok) return { success: true, message: "Connected to OpenAI API" };
      return { success: false, message: `OpenAI API returned status ${res.status}` };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Connection failed" };
    }
  }
}
