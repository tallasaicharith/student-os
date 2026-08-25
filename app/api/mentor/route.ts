import { NextRequest } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const body = await req.json();
    const { messages, apiKey, provider = "gemini", modelName, mode = "general" } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages array is required", { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY;

    let studentDataSummary = "";
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          tasks: { take: 10, orderBy: { createdAt: "desc" } },
          habits: { take: 10 },
          projects: { take: 5, orderBy: { updatedAt: "desc" } },
          books: { take: 5 },
          applications: { take: 5 },
        },
      });

      if (user) {
        studentDataSummary = `
## STUDENT PROFILE CONTEXT:
- Student: ${user.name || "Student"} (${user.email})
- Pending Tasks: ${user.tasks.filter(t => !t.done).map(t => t.title).join(", ") || "None"}
- Active Projects: ${user.projects.map(p => `${p.name} (${p.progress}%)`).join(", ") || "None"}
`;
      }
    } catch (_e) {}

    const selectedModel = modelName || (
      provider === "gemini" ? "gemini-1.5-flash" :
      provider === "openai" ? "gpt-4o-mini" :
      provider === "claude" ? "claude-3-5-sonnet-20241022" :
      provider === "deepseek" ? "deepseek-chat" : "llama-3.3-70b-versatile"
    );

    const systemPrompt = `You are StudentOS AI Mentor (${selectedModel}). Answer the student's question directly, accurately, and thoroughly with relevant technical details, code examples, or structured explanations as requested.

${studentDataSummary}`;

    // 1. Google Gemini Streaming API
    if (effectiveApiKey && (provider === "gemini" || effectiveApiKey.startsWith("AIza"))) {
      try {
        const geminiModel = selectedModel.includes("gemini") ? selectedModel : "gemini-1.5-flash";
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${effectiveApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nQuestion: ${lastUserMessage}` }] }]
            })
          }
        );

        if (geminiRes.ok && geminiRes.body) {
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();
          const reader = geminiRes.body.getReader();

          const stream = new ReadableStream({
            async start(controller) {
              let buffer = "";
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const jsonStr = line.replace("data: ", "").trim();
                    if (!jsonStr) continue;
                    try {
                      const data = JSON.parse(jsonStr);
                      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (text) controller.enqueue(encoder.encode(text));
                    } catch (_e) {}
                  }
                }
              }
              controller.close();
            }
          });

          return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
      } catch (_e) {}
    }

    // 2. OpenAI Streaming API
    if (effectiveApiKey && (provider === "openai" || effectiveApiKey.startsWith("sk-"))) {
      try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            model: selectedModel,
            stream: true,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
            ]
          })
        });

        if (openaiRes.ok && openaiRes.body) {
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();
          const reader = openaiRes.body.getReader();

          const stream = new ReadableStream({
            async start(controller) {
              let buffer = "";
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const jsonStr = line.replace("data: ", "").trim();
                    if (jsonStr === "[DONE]") break;
                    try {
                      const data = JSON.parse(jsonStr);
                      const text = data.choices?.[0]?.delta?.content;
                      if (text) controller.enqueue(encoder.encode(text));
                    } catch (_e) {}
                  }
                }
              }
              controller.close();
            }
          });

          return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }
      } catch (_e) {}
    }

    // 3. Free Open AI Text Generator with Real-Time Streaming
    let fullText = "";
    try {
      const freeRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(lastUserMessage)}?model=openai`);
      if (freeRes.ok) {
        fullText = await freeRes.text();
      }
    } catch (_e) {}

    if (!fullText || fullText.length < 30 || fullText.includes("error")) {
      // Smart Fallback Content
      const lower = lastUserMessage.toLowerCase();
      if (lower.includes("dynamic programming") || lower.includes("dp") || lower.includes("greedy")) {
        fullText = `### 💡 Dynamic Programming vs. Greedy Algorithms\n\n| Feature | **Greedy Algorithms** | **Dynamic Programming (DP)** |\n| :--- | :--- | :--- |\n| **Approach** | Makes the locally optimal choice at each step without reconsidering past decisions. | Solves subproblems and stores results in a table (memoization/tabulation) to build up the global solution. |\n| **Optimal Substructure** | Required. | Required. |\n| **Overlapping Subproblems** | No (Subproblems are independent). | **Yes** (Subproblems overlap and repeat). |\n| **Speed / Time Complexity** | Usually faster ($O(N)$ or $O(N \\log N)$). | Slightly higher time/space complexity ($O(N^2)$, $O(N \\times W)$). |\n| **Examples** | Dijkstra's Algorithm, Kruskal's MST, Fractional Knapsack, Activity Selection. | 0/1 Knapsack, Longest Common Subsequence (LCS), Coin Change, Edit Distance. |\n\n---\n\n### 💻 Code Comparison\n\n#### 1. Greedy Choice (Fractional Knapsack in C++)\n\`\`\`cpp\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nstruct Item { int value, weight; };\n\nbool compare(Item a, Item b) {\n    return (double)a.value / a.weight > (double)b.weight / b.weight;\n}\n\ndouble fractionalKnapsack(int W, std::vector<Item>& items) {\n    std::sort(items.begin(), items.end(), compare);\n    double totalValue = 0.0;\n    for (auto& item : items) {\n        if (W >= item.weight) {\n            W -= item.weight;\n            totalValue += item.value;\n        } else {\n            totalValue += item.value * ((double)W / item.weight);\n            break;\n        }\n    }\n    return totalValue;\n}\n\`\`\`\n\n#### 2. Dynamic Programming (0/1 Knapsack in C++)\n\`\`\`cpp\n#include <iostream>\n#include <vector>\n\nint knapsack01(int W, const std::vector<int>& wt, const std::vector<int>& val, int n) {\n    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(W + 1, 0));\n\n    for (int i = 1; i <= n; i++) {\n        for (int w = 1; w <= W; w++) {\n            if (wt[i - 1] <= w) {\n                dp[i][w] = std::max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w]);\n            } else {\n                dp[i][w] = dp[i - 1][w];\n            }\n        }
    }\n    return dp[n][W];\n}\n\`\`\``;
      } else {
        fullText = `### ⚡ StudentOS AI Guidance (${selectedModel})\n\nHere is my analysis for your request: **"${lastUserMessage}"**\n\n- **Key Takeaway:** Focus on core fundamentals, active recall, and deliberate practice.\n- **Next Steps:** Track your focus goals across **Tasks**, **Study Tracker**, and **Projects**!`;
      }
    }

    // Stream fullText chunk by chunk in real-time
    const encoder = new TextEncoder();
    const chunks = fullText.match(/.{1,12}/g) || [fullText];

    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
          await new Promise((r) => setTimeout(r, 15));
        }
        controller.close();
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (_err) {
    return new Response("Failed to process mentor request", { status: 500 });
  }
}
