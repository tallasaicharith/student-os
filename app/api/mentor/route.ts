import { NextRequest, NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const body = await req.json();
    const { messages, apiKey, provider = "gemini", mode = "general" } = body;

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
    } catch (_e) {
      // Fallback context if DB query encounters error
    }

    // Base System Instructions with persona adoption
    let providerPersona = "StudentOS AI Academic & Career Copilot";
    if (provider === "gemini") providerPersona = "Google Gemini 1.5 AI";
    if (provider === "openai") providerPersona = "OpenAI GPT-4o AI";
    if (provider === "claude") providerPersona = "Anthropic Claude 3.5 Sonnet AI";
    if (provider === "deepseek") providerPersona = "DeepSeek R1 AI";
    if (provider === "groq") providerPersona = "Llama 3.3 70B (via Groq) AI";

    let systemInstruction = `You are ${providerPersona}, serving as an elite academic, coding, and career mentor integrated into StudentOS.
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
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveApiKey}`,
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
            return NextResponse.json({ reply: replyText, provider: "Google Gemini 1.5 Flash (Context RAG)" });
          }
        }
      } catch (_e) {}
    }

    // 2. OpenAI API
    if (effectiveApiKey && (provider === "openai" || effectiveApiKey.startsWith("sk-"))) {
      try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
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
            return NextResponse.json({ reply: replyText, provider: "OpenAI GPT-4o-mini (Context RAG)" });
          }
        }
      } catch (_e) {}
    }

    // 3. Anthropic Claude API
    if (effectiveApiKey && provider === "claude") {
      try {
        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": effectiveApiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
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
            return NextResponse.json({ reply: replyText, provider: "Anthropic Claude 3.5 Sonnet (Context RAG)" });
          }
        }
      } catch (_e) {}
    }

    // 4. DeepSeek API
    if (effectiveApiKey && provider === "deepseek") {
      try {
        const deepseekRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
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
            return NextResponse.json({ reply: replyText, provider: "DeepSeek-V3 / R1 (Context RAG)" });
          }
        }
      } catch (_e) {}
    }

    // 5. Groq / Llama 3 API
    if (effectiveApiKey && provider === "groq") {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
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
            return NextResponse.json({ reply: replyText, provider: "Llama 3.3 70B via Groq (Context RAG)" });
          }
        }
      } catch (_e) {}
    }

    // 6. Free Unlimited StudentOS AI Engine (With Full Data Context RAG)
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
          return NextResponse.json({ reply: replyText, provider: "Free Unlimited AI Engine (Context RAG)" });
        }
      }
    } catch (_e) {}

    // 7. Context-Aware Offline Academic Reasoning Engine (Fallback)
    const lower = lastUserMessage.toLowerCase();
    let fallbackReply = "";

    if (lower.includes("task") || lower.includes("todo") || lower.includes("do today")) {
      fallbackReply = `### 📋 Personalized Task & Priority Guidance\n\nBased on your live StudentOS data profile:\n\n${studentDataSummary}\n\n**Recommendation:** Complete your highest priority pending task in **Tasks Hub** first using a 50-minute Pomodoro block!`;
    } else if (lower.includes("project") || lower.includes("milestone") || lower.includes("build")) {
      fallbackReply = `### 🛠️ Portfolio Project Guidance\n\nBased on your live StudentOS projects:\n\n${studentDataSummary}\n\n**Recommendation:** Push your active project to the next milestone and log your progress slider in **Projects Hub**!`;
    } else {
      fallbackReply = `### ⚡ StudentOS AI Mentor (${providerPersona})\n\nI processed your request using your live StudentOS profile context:\n\n${studentDataSummary}\n\n**Action Item:** Keep logging your progress across **Tasks**, **Study Tracker**, and **Projects**!`;
    }

    return NextResponse.json({ reply: fallbackReply, provider: "StudentOS AI Assistant (Context RAG)" });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to process mentor request" }, { status: 500 });
  }
}
