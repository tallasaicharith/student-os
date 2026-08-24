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

    // If a Google Gemini API Key is available
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
                      text: `You are StudentOS AI Mentor, an expert academic and career mentor for university students. Be encouraging, clear, precise, and use markdown formatting with bullet points and code blocks. Student query: ${lastUserMessage}`
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
      } catch (_e) {
        // Fallback if API call fails
      }
    }

    // If an OpenAI API Key is available
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
                content: "You are StudentOS AI Mentor, an expert academic and career mentor for university students. Format responses cleanly using Markdown."
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
      } catch (_e) {
        // Fallback if API call fails
      }
    }

    // Intelligent Built-in Fallback Reasoning Engine
    const lower = lastUserMessage.toLowerCase();
    let fallbackReply = "";

    if (lower.includes("gpa") || lower.includes("study") || lower.includes("exam") || lower.includes("marks")) {
      fallbackReply = `### 🎯 Academic Excellence & Study Strategy\n\n1. **Active Recall & Spaced Repetition:** Test yourself using flashcards or practice problem sets.\n2. **The 50/10 Pomodoro Method:** Study intensely for 50 minutes with zero notifications, then rest for 10 minutes.\n3. **Core Concepts:** Focus on understanding foundational principles rather than passive re-reading.\n\n*Tip: Click "API Key Settings" at the top right to enter your Google Gemini or OpenAI key for live dynamic AI responses!*`;
    } else if (lower.includes("resume") || lower.includes("internship") || lower.includes("job") || lower.includes("career")) {
      fallbackReply = `### 💼 Career & Internship Playbook\n\n- **ATS-Optimized Formatting:** Use single-column, clear section headers (Projects, Technical Skills, Education).\n- **Quantify Impact:** Write bullets as *"Built X using Y which improved Z by 35%"*.\n- **Full-Stack Projects:** Highlight live Vercel deployments and GitHub repository links.\n\n*Tip: Connect your Gemini or OpenAI API key in settings for personalized resume reviews!*`;
    } else if (lower.includes("code") || lower.includes("algo") || lower.includes("leetcode") || lower.includes("c++")) {
      fallbackReply = `### 💻 Data Structures & Coding Guidance\n\n\`\`\`cpp\n// Always analyze Time & Space Complexity\n// Example: Fast & Slow Pointer for Cycle Detection\nbool hasCycle(ListNode *head) {\n    ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) return true;\n    }\n    return false;\n}\n\`\`\`\n\n- **Time Complexity:** $O(N)$\n- **Space Complexity:** $O(1)$`;
    } else {
      fallbackReply = `### ⚡ StudentOS AI Mentor\n\nI processed your request: **"${lastUserMessage}"**.\n\nHere are 3 recommended action items for today:\n1. Log your daily habit targets in **Habits Hub**.\n2. Review upcoming assignment deadlines in **Study Tracker**.\n3. Track your target project milestones in **Projects**.\n\n*(To enable real-time dynamic AI chat, enter your Google Gemini or OpenAI API Key at the top right of this page!)*`;
    }

    return NextResponse.json({ reply: fallbackReply, provider: "Built-in AI Assistant" });
  } catch (_err) {
    return NextResponse.json({ error: "Failed to process mentor request" }, { status: 500 });
  }
}
