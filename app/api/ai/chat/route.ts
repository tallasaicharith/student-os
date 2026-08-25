import { NextRequest } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";
import { aiRegistry } from "@/lib/ai/registry";
import { StudentContextService } from "@/lib/ai/context";
import { AttachmentProcessor } from "@/lib/ai/attachment-processor";
import { ProviderName } from "@/lib/ai/types";

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

    // 1. Automatically Resolve Saved API Key from Database if Not Passed in Body
    let resolvedApiKey = reqApiKey ? String(reqApiKey).trim() : "";

    if (!resolvedApiKey && userId !== "guest") {
      try {
        const config = await db.aIProviderConfig.findUnique({ where: { userId } });
        if (config) {
          if (provider === "gemini" && config.geminiKey) resolvedApiKey = config.geminiKey;
          else if (provider === "openai" && config.openaiKey) resolvedApiKey = config.openaiKey;
          else if (provider === "claude" && config.anthropicKey) resolvedApiKey = config.anthropicKey;
          else if (provider === "groq" && config.groqKey) resolvedApiKey = config.groqKey;
        }
      } catch (_dbErr) {}
    }

    // Fallback to process.env if available
    if (!resolvedApiKey) {
      if (provider === "gemini") resolvedApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
      else if (provider === "openai") resolvedApiKey = process.env.OPENAI_API_KEY || "";
      else if (provider === "claude") resolvedApiKey = process.env.ANTHROPIC_API_KEY || "";
      else if (provider === "groq") resolvedApiKey = process.env.GROQ_API_KEY || "";
    }

    // 2. Process Multi-Turn History & Attachment Context
    const lastUserMessageObj = messages[messages.length - 1];
    const lastUserMessage = lastUserMessageObj?.content || "";
    const attachmentContext = AttachmentProcessor.processAttachments(attachments || lastUserMessageObj?.attachments);
    const processedMessages = StudentContextService.manageConversationHistory(messages, 14);

    // 3. Minimum Necessary Student Context
    const studentContext = await StudentContextService.getRelevantContext(userId, {
      includeTasks: mode === "general" || mode === "study_plan",
      includeProjects: mode === "general" || mode === "code_review" || mode === "resume_review",
      includeSchedule: mode === "study_plan",
    });

    // 4. System Instructions
    let modePrompt = `You are StudentOS Multi-Turn AI Copilot (${model}).
CRITICAL MULTI-TURN INSTRUCTION:
- You are in a continuous, natural multi-turn conversation with the student.
- Understand pronouns ("it", "this", "that"), code references ("line 5", "the previous code"), and follow-up requests ("make it simpler", "give an example", "convert to Python", "question 2") seamlessly based on prior history.
- Answer directly, accurately, and thoroughly with clear markdown tables and syntax-highlighted code blocks.`;

    if (mode === "explain") {
      modePrompt = `You are StudentOS Concept Explainer. Structure concept explanations with: 1. Simple Explanation, 2. Intuition, 3. Real-world Analogy, 4. Code Example, 5. Common Mistakes, 6. Quick Test, 7. Summary. Maintain multi-turn memory.`;
    } else if (mode === "code_review") {
      modePrompt = `You are StudentOS Code Reviewer. Analyze code for bugs, edge cases, O(N) time/space complexity, and provide corrected clean code. Maintain multi-turn memory.`;
    } else if (mode === "study_plan") {
      modePrompt = `You are StudentOS Study Plan Builder. Generate structured daily & weekly timetables based on active tasks. Maintain multi-turn memory.`;
    } else if (mode === "resume_review") {
      modePrompt = `You are StudentOS ATS Resume Reviewer. Provide quantifiable bullet point rewrites and ATS formatting advice. Maintain multi-turn memory.`;
    } else if (mode === "mock_interview") {
      modePrompt = `You are StudentOS Interactive Mock Interviewer. Ask one question at a time. Evaluate the student's previous answer briefly, provide constructive feedback, and ask the next question.`;
    } else if (mode === "quiz_gen") {
      modePrompt = `You are StudentOS Exam Quiz Generator. Generate multiple-choice questions with 4 options (A, B, C, D) and explain correct answers at the end. Maintain multi-turn memory.`;
    }

    const systemPrompt = `${modePrompt}\n\n${studentContext}${attachmentContext}`;

    // 5. Smart Routing & Provider Stream
    const routed = aiRegistry.routeModel(lastUserMessage, mode, provider as ProviderName, model);
    const selectedProvider = aiRegistry.getProvider(routed.provider);

    let stream: ReadableStream<Uint8Array>;
    try {
      stream = await selectedProvider.stream({
        provider: routed.provider,
        model: routed.model,
        messages: processedMessages,
        systemPrompt,
        apiKey: resolvedApiKey,
      });
    } catch (_primaryErr) {
      // Graceful Stream Fallback if API key missing or provider error
      const encoder = new TextEncoder();
      const pName = String(provider).toUpperCase();
      const fallbackMsg = `⚠️ API Key Action Required:\n\nYour ${pName} API Key is missing or invalid.\n\nTo fix this permanently so you never have to re-enter it:\n1. Go to Settings (/settings)\n2. Paste your Google AI Studio key (starts with AIza...)\n3. Click Save All Settings\n\nOnce saved, StudentOS stores your key securely in the database for your account permanently!`;

      stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fallbackMsg));
          controller.close();
        },
      });
    }

    // 6. Asynchronous Database Persistence
    const latencyMs = Date.now() - startTime;
    (async () => {
      try {
        let activeConvId = reqConversationId;

        if (!activeConvId) {
          const generatedTitle = lastUserMessage.split(" ").slice(0, 5).join(" ") || "New Conversation";
          const conv = await db.aIConversation.create({
            data: {
              userId,
              title: generatedTitle,
              selectedProvider: routed.provider,
              selectedModel: routed.model,
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
            provider: routed.provider,
            model: routed.model,
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
