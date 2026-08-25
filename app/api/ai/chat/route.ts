import { NextRequest } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";
import { aiRegistry } from "@/lib/ai/registry";
import { StudentContextService } from "@/lib/ai/context";
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
      conversationId,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array is required", { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // 1. Minimum Necessary Student Context (RAG)
    const studentContext = await StudentContextService.getRelevantContext(userId, {
      includeTasks: mode === "general" || mode === "study_plan",
      includeProjects: mode === "general" || mode === "code_review" || mode === "resume_review",
      includeSchedule: mode === "study_plan",
    });

    // 2. Specialized System Prompts per Mode
    let modePrompt = "You are StudentOS General AI Mentor. Provide clear, accurate, and direct guidance.";

    if (mode === "explain") {
      modePrompt = `You are StudentOS Concept Explainer.
Structured Response Format:
1. Simple Explanation
2. Intuition
3. Real-world Analogy
4. Code/Example (if applicable)
5. Common Mistakes
6. Quick Test Question
7. Summary`;
    } else if (mode === "code_review") {
      modePrompt = `You are StudentOS Code Reviewer.
Analyze the user's code for:
- Correctness & Bugs
- Edge Cases
- Time Complexity O(N) & Space Complexity O(1)
- Readability & Best Practices
- Improved Correct Code Solution`;
    } else if (mode === "study_plan") {
      modePrompt = `You are StudentOS Study Plan Builder.
Generate a structured time-boxed study schedule based on the student's subjects and tasks. Provide daily and weekly targets.`;
    } else if (mode === "resume_review") {
      modePrompt = `You are StudentOS ATS Resume Reviewer.
Analyze projects and experience for ATS optimization. Provide strong action verbs, quantifiable metrics, and bullet point rewrites.`;
    } else if (mode === "mock_interview") {
      modePrompt = `You are StudentOS Interactive Mock Interviewer.
Ask one question at a time. Evaluate the student's previous answer briefly, provide constructive feedback, and then ask the next question.`;
    } else if (mode === "quiz_gen") {
      modePrompt = `You are StudentOS Exam Quiz Generator.
Generate 5 multiple-choice questions with 4 options each (A, B, C, D) and explain the correct answers clearly at the end.`;
    }

    const systemPrompt = `${modePrompt}\n\n${studentContext}`;

    // 3. Smart Routing & Fallback Execution
    const routed = aiRegistry.routeModel(lastUserMessage, mode, provider as ProviderName, model);
    const selectedProvider = aiRegistry.getProvider(routed.provider);

    let stream: ReadableStream<Uint8Array>;
    try {
      stream = await selectedProvider.stream({
        provider: routed.provider,
        model: routed.model,
        messages,
        systemPrompt,
        apiKey,
      });
    } catch (_primaryErr) {
      // Fallback policy: try secondary provider if primary key is missing or fails
      const fallbackName = routed.provider === "gemini" ? "groq" : "gemini";
      const fallbackProvider = aiRegistry.getProvider(fallbackName);

      stream = await fallbackProvider.stream({
        provider: fallbackName,
        model: "gemini-2.0-flash",
        messages,
        systemPrompt: `${systemPrompt}\n\n[Note: Fallback model response active]`,
      });
    }

    // 4. Asynchronous DB Persistence & Token Usage Tracking
    const latencyMs = Date.now() - startTime;
    (async () => {
      try {
        await db.aIUsage.create({
          data: {
            userId,
            conversationId: conversationId || null,
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
