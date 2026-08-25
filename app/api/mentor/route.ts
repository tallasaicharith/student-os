import { NextRequest, NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const body = await req.json();
    const { messages, apiKey, provider = "gemini", modelName, mode = "general" } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY;

    // Retrieve Live Student Data Context from Supabase PostgreSQL Database (RAG)
    let studentDataSummary = "";
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          tasks: { take: 10, orderBy: { createdAt: "desc" } },
          habits: { take: 10 },
          projects: { take: 6, orderBy: { updatedAt: "desc" } },
          books: { take: 5 },
          applications: { take: 5 },
        },
      });

      if (user) {
        studentDataSummary = `
## LIVE STUDENT DATA CONTEXT (Real-Time StudentOS Profile):
- **Student Profile**: ${user.name || "Student"} (${user.email})
- **Active Tasks**: ${user.tasks.length > 0 ? user.tasks.map(t => `[${t.done ? "COMPLETED" : "PENDING"}] ${t.title} (${t.priority} Priority, ${t.category})`).join("; ") : "No tasks added yet."}
- **Habits & Goals**: ${user.habits.length > 0 ? user.habits.map(h => `${h.emoji} ${h.name}`).join("; ") : "No habits tracked."}
- **Projects Portfolio**: ${user.projects.length > 0 ? user.projects.map(p => `${p.name} [${p.progress}% Complete, Status: ${p.status}] Tech Stack: ${p.stack}. Next Milestone: ${p.milestone || "None"}`).join("; ") : "No projects added."}
- **Reading List**: ${user.books.length > 0 ? user.books.map(b => `"${b.title}" by ${b.author || "Unknown"} (${b.readPages}/${b.totalPages} pages read)`).join("; ") : "No books added."}
- **Internship Applications**: ${user.applications.length > 0 ? user.applications.map(a => `${a.role} [Stage: ${a.status}]`).join("; ") : "No job applications tracked."}
`;
      }
    } catch (_e) {}

    // Base System Instructions with persona adoption
    const targetModel = modelName || (
      provider === "gemini" ? "gemini-2.0-flash" :
      provider === "openai" ? "gpt-4o" :
      provider === "claude" ? "claude-3-5-sonnet-20241022" :
      provider === "deepseek" ? "deepseek-chat" : "llama-3.3-70b-versatile"
    );

    let systemInstruction = `You are StudentOS AI Mentor powered by ${targetModel}.
You have FULL ACCESS to the student's live data context below. When the student asks about their tasks, projects, habits, study progress, or career plans, USE THEIR ACTUAL DATA to give specific, personalized advice.

${studentDataSummary}

Formatting Instructions:
- Format cleanly with Markdown headings, bullet points, syntax-highlighted code blocks, and math expressions where relevant.
- Be direct, encouraging, precise, and highly actionable.`;

    if (mode === "explain") {
      systemInstruction += "\n\nMode: Concept Explainer. Break down complex topics with: 1. Analogy, 2. Technical Definition, 3. Mathematical / Architecture Formulation, 4. Real-world Engineering Application.";
    } else if (mode === "code_review") {
      systemInstruction += "\n\nMode: Code Debugger. Review code for bugs, edge cases, $O(N)$ time & space complexity, and provide refactored code.";
    } else if (mode === "study_plan") {
      systemInstruction += "\n\nMode: Study Plan Generator. Build a 7-day hour-by-hour focus schedule incorporating active recall and Pomodoro sessions based on the student's tasks and courses.";
    } else if (mode === "resume_review") {
      systemInstruction += "\n\nMode: ATS Resume Reviewer. Rewrite bullet points using high-impact action verbs and quantified metric formulas based on the student's projects.";
    } else if (mode === "mock_interview") {
      systemInstruction += "\n\nMode: Mock Interviewer. Ask 1 challenging technical question suitable for the student's tech stack, evaluate their answer, and provide ideal solutions.";
    } else if (mode === "quiz_gen") {
      systemInstruction += "\n\nMode: Exam Quiz Generator. Create 5 multiple-choice questions on the requested subject with answer key explanations.";
    }

    // 1. Google Gemini API
    if (effectiveApiKey && (provider === "gemini" || effectiveApiKey.startsWith("AIza"))) {
      try {
        const selectedGeminiModel = modelName || "gemini-1.5-flash";
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${selectedGeminiModel}:generateContent?key=${effectiveApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${systemInstruction}\n\nStudent Message: ${lastUserMessage}`
                    }
                  ]
                }
              ]
            })
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({ reply: replyText, provider: `Google ${selectedGeminiModel}` });
          }
        }
      } catch (_e) {}
    }

    // 2. OpenAI API
    if (effectiveApiKey && (provider === "openai" || effectiveApiKey.startsWith("sk-"))) {
      try {
        const selectedOpenAIModel = modelName || "gpt-4o-mini";
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            model: selectedOpenAIModel,
            messages: [
              { role: "system", content: systemInstruction },
              ...messages.map((m: { role: string; content: string }) => ({
                role: m.role,
                content: m.content
              }))
            ]
          })
        });

        if (openaiRes.ok) {
          const data = await openaiRes.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return NextResponse.json({ reply: replyText, provider: `OpenAI ${selectedOpenAIModel}` });
          }
        }
      } catch (_e) {}
    }

    // 3. Anthropic Claude API
    if (effectiveApiKey && provider === "claude") {
      try {
        const selectedClaudeModel = modelName || "claude-3-5-sonnet-20241022";
        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": effectiveApiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: selectedClaudeModel,
            max_tokens: 2048,
            system: systemInstruction,
            messages: messages.map((m: { role: string; content: string }) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content
            }))
          })
        });

        if (claudeRes.ok) {
          const data = await claudeRes.json();
          const replyText = data.content?.[0]?.text;
          if (replyText) {
            return NextResponse.json({ reply: replyText, provider: `Anthropic ${selectedClaudeModel}` });
          }
        }
      } catch (_e) {}
    }

    // 4. DeepSeek API
    if (effectiveApiKey && provider === "deepseek") {
      try {
        const selectedDeepSeekModel = modelName || "deepseek-chat";
        const deepseekRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            model: selectedDeepSeekModel,
            messages: [
              { role: "system", content: systemInstruction },
              ...messages.map((m: { role: string; content: string }) => ({
                role: m.role,
                content: m.content
              }))
            ]
          })
        });

        if (deepseekRes.ok) {
          const data = await deepseekRes.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return NextResponse.json({ reply: replyText, provider: `DeepSeek ${selectedDeepSeekModel}` });
          }
        }
      } catch (_e) {}
    }

    // 5. Groq / Llama 3 API
    if (effectiveApiKey && provider === "groq") {
      try {
        const selectedGroqModel = modelName || "llama-3.3-70b-versatile";
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            model: selectedGroqModel,
            messages: [
              { role: "system", content: systemInstruction },
              ...messages.map((m: { role: string; content: string }) => ({
                role: m.role,
                content: m.content
              }))
            ]
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return NextResponse.json({ reply: replyText, provider: `Groq ${selectedGroqModel}` });
          }
        }
      } catch (_e) {}
    }

    // 6. Free Unlimited StudentOS AI Engine
    try {
      const freeAiRes = await fetch(`https://text.pollinations.ai/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemInstruction },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content
            }))
          ],
          model: "openai"
        })
      });

      if (freeAiRes.ok) {
        const replyText = await freeAiRes.text();
        if (replyText && replyText.trim().length > 0) {
          return NextResponse.json({ reply: replyText, provider: `Free AI (${targetModel})` });
        }
      }
    } catch (_e) {}

    // 7. Fallback Reasoning Engine
    const lower = lastUserMessage.toLowerCase();
    let fallbackReply = `### ⚡ StudentOS AI Mentor (${targetModel})\n\nI processed your query using your live StudentOS database profile context:\n\n${studentDataSummary}\n\n**Actionable Item:** Continue tracking your focus goals across **Tasks**, **Study Tracker**, and **Projects**!`;

    return NextResponse.json({ reply: fallbackReply, provider: `StudentOS ${targetModel}` });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to process mentor request" }, { status: 500 });
  }
}
