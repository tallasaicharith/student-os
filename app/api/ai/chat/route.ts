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
      apiKey,
      provider = "gemini",
      model = "gemini-2.0-flash",
      mode = "general",
      conversationId: reqConversationId,
      attachments,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array is required", { status: 400 });
    }

    // 1. Process Multi-Turn History & Attachment Context
    const lastUserMessageObj = messages[messages.length - 1];
    const lastUserMessage = lastUserMessageObj?.content || "";

    const attachmentContext = AttachmentProcessor.processAttachments(attachments || lastUserMessageObj?.attachments);

    // 2. Truncate long history while preserving multi-turn context
    const processedMessages = StudentContextService.manageConversationHistory(messages, 14);

    // 3. Minimum Necessary Student Context
    const studentContext = await StudentContextService.getRelevantContext(userId, {
      includeTasks: mode === "general" || mode === "study_plan",
      includeProjects: mode === "general" || mode === "code_review" || mode === "resume_review",
      includeSchedule: mode === "study_plan",
    });

    // 4. Multi-Turn Conversational System Instructions
    let modePrompt = `You are StudentOS Multi-Turn AI Copilot (${model}).
CRITICAL MULTI-TURN INSTRUCTION:
- You are in a continuous, natural multi-turn conversation with the student.
- Understand pronouns ("it", "this", "that"), code references ("line 5", "the previous code"), and follow-up requests ("make it simpler", "give an example", "convert to Python", "question 2") seamlessly based on the prior conversation history.
- Answer directly, accurately, and thoroughly with clear markdown tables and syntax-highlighted code blocks.`;

    if (mode === "explain") {
      modePrompt = `You are StudentOS Concept Explainer.
Structure concept explanations with: 1. Simple Explanation, 2. Intuition, 3. Real-world Analogy, 4. Code Example, 5. Common Mistakes, 6. Quick Test, 7. Summary. Maintain multi-turn memory.`;
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
        apiKey,
      });
    } catch (_primaryErr) {
      // Fallback execution
      const fallbackName = routed.provider === "gemini" ? "groq" : "gemini";
      const fallbackProvider = aiRegistry.getProvider(fallbackName);

      stream = await fallbackProvider.stream({
        provider: fallbackName,
        model: "gemini-2.0-flash",
        messages: processedMessages,
        systemPrompt: `${systemPrompt}\n\n[Note: Fallback response active]`,
      });
    }

    // 6. Asynchronous Database Persistence (Conversation + Messages + Usage)
    const latencyMs = Date.now() - startTime;
    (async () => {
      try {
        let activeConvId = reqConversationId;

        if (!activeConvId) {
          // Auto-generate short title from first 6 words of first message
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

        // Record User Message
        await db.aIMessage.create({
          data: {
            conversationId: activeConvId,
            role: "user",
            content: lastUserMessage,
            attachments: attachments ? (attachments as any) : undefined,
          },
        });

        // Record Usage
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
