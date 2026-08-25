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
      userId = "guest_user",
      mode = "general",
      conversationId: reqConversationId,
      attachments,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array is required", { status: 400 });
    }

    // 1. Enforce Google Gemini API Key Resolution
    let resolvedApiKey = reqApiKey ? String(reqApiKey).trim() : "";

    if (!resolvedApiKey || resolvedApiKey.startsWith("sk-")) {
      try {
        const userConfig = await db.aIProviderConfig.findUnique({ where: { userId } });
        if (userConfig && userConfig.geminiKey) {
          resolvedApiKey = userConfig.geminiKey;
        }
      } catch (_dbErr) {}
    }

    if (!resolvedApiKey || resolvedApiKey.startsWith("sk-")) {
      resolvedApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    }

    // 2. LangChain Pipeline Direct Gemini Execution
    const stream = await LangChainExecutionChain.runChain({
      messages,
      provider: "gemini" as ProviderName,
      model: "gemini-2.5-flash",
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
            selectedProvider: "gemini",
            selectedModel: "gemini-2.5-flash",
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
