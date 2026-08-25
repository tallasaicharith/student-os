import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { LangChainExecutionChain } from "@/lib/ai/langchain-chain";
import { ProviderName } from "@/lib/ai/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let reqMessages: any[] = [];
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

    reqMessages = messages || [];

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array is required", { status: 400 });
    }

    // 1. Enforce Server Environment Active Gemini API Key (GEMINI_API_KEY || GOOGLE_API_KEY)
    const envApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    let resolvedApiKey = envApiKey;

    if (!resolvedApiKey || resolvedApiKey.startsWith("sk-")) {
      let clientKey = reqApiKey ? String(reqApiKey).trim() : "";
      if (clientKey && !clientKey.startsWith("sk-")) {
        resolvedApiKey = clientKey;
      }
    }

    if (!resolvedApiKey || resolvedApiKey.startsWith("sk-")) {
      try {
        const userConfig = await db.aIProviderConfig.findUnique({ where: { userId } });
        if (userConfig && userConfig.geminiKey) {
          resolvedApiKey = userConfig.geminiKey;
        }
      } catch (_dbErr) {}
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

    // 3. Non-blocking Background Async Persistence (never blocks AI response)
    Promise.resolve().then(async () => {
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
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`⚠️ ${errorMsg}`));
        controller.close();
      },
    });

    return new Response(errorStream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }
}
