import { NextRequest } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";
import { ProviderName } from "@/lib/ai/types";
import { LangChainExecutionChain } from "@/lib/ai/langchain-chain";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let userId = "guest";
  try {
    userId = await getOrCreateUser();
  } catch (_e) {}

  try {
    const body = await req.json();
    const {
      messages,
      apiKey: reqApiKey,
      provider = "gemini",
      model = "gemini-2.0-flash",
      mode = "general",
      conversationId: reqConversationId,
      attachments,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array is required", { status: 400 });
    }

    // 1. Multi-Tier Key Resolution (Request -> User DB -> Global DB -> ENV)
    let resolvedApiKey = reqApiKey ? String(reqApiKey).trim() : "";

    if (!resolvedApiKey) {
      try {
        const userConfig = await db.aIProviderConfig.findUnique({ where: { userId } });
        if (userConfig) {
          if (provider === "gemini" && userConfig.geminiKey) resolvedApiKey = userConfig.geminiKey;
          else if (provider === "openai" && userConfig.openaiKey) resolvedApiKey = userConfig.openaiKey;
          else if (provider === "claude" && userConfig.anthropicKey) resolvedApiKey = userConfig.anthropicKey;
          else if (provider === "groq" && userConfig.groqKey) resolvedApiKey = userConfig.groqKey;
        }

        if (!resolvedApiKey) {
          const globalConfig = await db.aIProviderConfig.findFirst({
            where: { geminiKey: { not: null } },
            orderBy: { updatedAt: "desc" },
          });
          if (globalConfig && globalConfig.geminiKey) {
            resolvedApiKey = globalConfig.geminiKey;
          }
        }
      } catch (_dbErr) {}
    }

    if (!resolvedApiKey) {
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

    // 3. Asynchronous Database Persistence
    const latencyMs = Date.now() - startTime;
    (async () => {
      try {
        const lastUserMessage = messages[messages.length - 1]?.content || "";
        let activeConvId = reqConversationId;

        if (!activeConvId) {
          const generatedTitle = lastUserMessage.split(" ").slice(0, 5).join(" ") || "New Conversation";
          const conv = await db.aIConversation.create({
            data: {
              userId,
              title: generatedTitle,
              selectedProvider: provider,
              selectedModel: model,
              mode,
            },
          });
          activeConvId = conv.id;
        }

        await db.aIMessage.create({
          data: {
            conversationId: activeConvId,
            role: "user",
            content: lastUserMessage,
            attachments: attachments ? (attachments as any) : undefined,
          },
        });

        await db.aIUsage.create({
          data: {
            userId,
            conversationId: activeConvId,
            provider,
            model,
            mode,
            latencyMs,
            status: "success",
          },
        });
      } catch (_dbErr) {}
    })();

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return new Response(
      err instanceof Error ? err.message : "Failed to process AI request",
      { status: 500 }
    );
  }
}
