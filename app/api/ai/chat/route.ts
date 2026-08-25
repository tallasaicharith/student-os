import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { LangChainExecutionChain } from "@/lib/ai/langchain-chain";
import { ProviderName } from "@/lib/ai/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      apiKey: reqApiKey,
      provider = "openai",
      model = "gpt-4o-mini",
      userId = "guest_user",
      mode = "general",
      conversationId: reqConversationId,
      attachments,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array is required", { status: 400 });
    }

    // 1. Multi-Tier Key Resolution (Request -> User DB -> Global DB -> ENV)
    let resolvedApiKey = reqApiKey ? String(reqApiKey).trim() : "";

    if (!resolvedApiKey || (provider === "openai" && !resolvedApiKey.startsWith("sk-"))) {
      try {
        const userConfig = await db.aIProviderConfig.findUnique({ where: { userId } });
        if (userConfig) {
          if (provider === "gemini" && userConfig.geminiKey) resolvedApiKey = userConfig.geminiKey;
          else if (provider === "openai" && userConfig.openaiKey) resolvedApiKey = userConfig.openaiKey;
          else if (provider === "claude" && userConfig.anthropicKey) resolvedApiKey = userConfig.anthropicKey;
          else if (provider === "groq" && userConfig.groqKey) resolvedApiKey = userConfig.groqKey;
        }
      } catch (_dbErr) {}
    }

    if (!resolvedApiKey || (provider === "openai" && !resolvedApiKey.startsWith("sk-"))) {
      if (provider === "gemini") resolvedApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
      else if (provider === "openai") resolvedApiKey = process.env.OPENAI_API_KEY || "";
      else if (provider === "claude") resolvedApiKey = process.env.ANTHROPIC_API_KEY || "";
      else if (provider === "groq") resolvedApiKey = process.env.GROQ_API_KEY || "";
    }

    // 2. LangChain Pipeline Chain Execution
    const stream = await LangChainExecutionChain.runChain({
      messages,
      provider: provider as ProviderName,
      model,
      mode,
      apiKey: resolvedApiKey,
      userId,
      attachments,
    });

    // 3. Background Async Persistence of Conversation
    try {
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const title = lastUserMsg.slice(0, 40) || "New Conversation";

      let convId = reqConversationId;
      if (!convId) {
        const newConv = await db.aIConversation.create({
          data: {
            userId,
            title,
            selectedProvider: provider,
            selectedModel: model,
            mode,
          },
        });
        convId = newConv.id;
      }

      await db.aIMessage.create({
        data: {
          conversationId: convId,
          role: "user",
          content: lastUserMsg,
        },
      });
    } catch (_dbSaveErr) {}

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
