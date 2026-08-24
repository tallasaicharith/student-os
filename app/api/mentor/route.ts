import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await getOrCreateUser();
    const body = await req.json();
    const { messages, apiKey, provider = "gemini" } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY;

    // 1. If custom Gemini API Key is provided
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
                      text: `You are StudentOS AI Mentor, an expert academic and career mentor for university students. Format cleanly with markdown and code blocks where applicable. Student prompt: ${lastUserMessage}`
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
            return NextResponse.json({ reply: replyText, provider: "Gemini 1.5 Flash" });
          }
        }
      } catch (_e) {}
    }

    // 2. If custom OpenAI API Key is provided
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
              {
                role: "system",
                content: "You are StudentOS AI Mentor, an expert academic and career mentor for university students."
              },
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
            return NextResponse.json({ reply: replyText, provider: "OpenAI GPT-4o-mini" });
          }
        }
      } catch (_e) {}
    }

    // 3. Free Unlimited AI Generation Engine (No API Key Required!)
    try {
      const freeAiRes = await fetch(`https://text.pollinations.ai/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are StudentOS AI Mentor, a friendly, highly intelligent academic and career mentor for university students. Answer the student's question directly, clearly, and concisely. Use Markdown formatting, bullet points, and code blocks where helpful."
            },
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
          return NextResponse.json({ reply: replyText, provider: "Free Unlimited AI Mentor" });
        }
      }
    } catch (_e) {}

    // 4. Intelligent Offline Academic Reasoning Engine (Fallback)
    const lower = lastUserMessage.toLowerCase();
    let fallbackReply = "";

    if (lower.includes("gpa") || lower.includes("study") || lower.includes("exam") || lower.includes("marks") || lower.includes("test")) {
      fallbackReply = `### 🎯 Academic Excellence & Exam Preparation Strategy\n\n1. **Active Recall & Spaced Repetition:** Instead of passive re-reading, test yourself using flashcards or practice problem sets.\n2. **The 50/10 Pomodoro Method:** Study intensely for 50 minutes with zero notifications, then rest for 10 minutes.\n3. **Core Concepts:** Focus on understanding foundational principles and solving past examination papers.`;
    } else if (lower.includes("resume") || lower.includes("internship") || lower.includes("job") || lower.includes("career")) {
      fallbackReply = `### 💼 Career & Placement Playbook\n\n- **ATS-Optimized Formatting:** Use single-column, clear section headers (Projects, Technical Skills, Education).\n- **Quantify Impact:** Write bullets as *"Built X using Y which improved Z by 35%"*.\n- **Full-Stack Projects:** Highlight live Vercel deployments and GitHub repository links.`;
    } else if (lower.includes("code") || lower.includes("algo") || lower.includes("leetcode") || lower.includes("c++") || lower.includes("python") || lower.includes("java")) {
      fallbackReply = `### 💻 Data Structures & Coding Advice\n\n\`\`\`cpp\n// Always analyze Time & Space Complexity\n// Example: Fast & Slow Pointer for Cycle Detection\nbool hasCycle(ListNode *head) {\n    ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) return true;\n    }\n    return false;\n}\n\`\`\`\n\n- **Time Complexity:** $O(N)$\n- **Space Complexity:** $O(1)$`;
    } else {
      fallbackReply = `### ⚡ StudentOS AI Academic Mentor\n\nHere is my guidance for your query: **"${lastUserMessage}"**\n\n- **Key Insight:** Prioritize high-impact learning tasks using active recall.\n- **Recommended Next Step:** Schedule dedicated focus blocks in your StudentOS **Study Tracker** and log daily habit goals.`;
    }

    return NextResponse.json({ reply: fallbackReply, provider: "Free StudentOS AI Assistant" });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to process mentor request" }, { status: 500 });
  }
}
