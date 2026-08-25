import { AIProvider, AIResponse, StreamRequest } from "../types";
import { sanitizeErrorMessage } from "../security";

export class AnthropicProvider implements AIProvider {
  name = "claude" as const;

  private getApiKey(reqKey?: string): string {
    const key = reqKey || process.env.ANTHROPIC_API_KEY;
    if (!key || key.trim().length === 0) {
      throw new Error("Anthropic Claude API key is missing. Add ANTHROPIC_API_KEY in .env or Settings.");
    }
    return key.trim();
  }

  async stream(req: StreamRequest): Promise<ReadableStream<Uint8Array>> {
    const apiKey = this.getApiKey(req.apiKey);
    const model = req.model || "claude-3-5-sonnet-20241022";

    const formattedMessages = req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          stream: true,
          max_tokens: 4096,
          system: req.systemPrompt || "You are StudentOS AI Mentor.",
          messages: formattedMessages,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Anthropic API returned ${res.status}: ${errText}`);
      }

      if (!res.body) throw new Error("Anthropic API returned empty body");

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
                  if (data.type === "content_block_delta" && data.delta?.text) {
                    controller.enqueue(encoder.encode(data.delta.text));
                  }
                } catch (_e) {}
              }
            }
          }
          controller.close();
        },
      });
    } catch (err) {
      throw sanitizeErrorMessage(err, "claude");
    }
  }

  async generate(req: StreamRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const apiKey = this.getApiKey(req.apiKey);
    const model = req.model || "claude-3-5-sonnet-20241022";

    const formattedMessages = req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system: req.systemPrompt || "You are StudentOS AI Mentor.",
          messages: formattedMessages,
        }),
      });

      if (!res.ok) throw new Error(`Anthropic API returned status ${res.status}`);

      const data = await res.json();
      const text = data.content?.[0]?.text || "";

      return {
        content: text,
        provider: "claude",
        model,
        inputTokens: data.usage?.input_tokens,
        outputTokens: data.usage?.output_tokens,
        latencyMs: Date.now() - startTime,
      };
    } catch (err) {
      throw sanitizeErrorMessage(err, "claude");
    }
  }

  async testConnection(apiKey?: string): Promise<{ success: boolean; message: string }> {
    try {
      const key = this.getApiKey(apiKey);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 10,
          messages: [{ role: "user", content: "ping" }],
        }),
      });

      if (res.ok) return { success: true, message: "Connected to Anthropic Claude API" };
      return { success: false, message: `Anthropic API returned status ${res.status}` };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Connection failed" };
    }
  }
}
