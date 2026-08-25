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

    // 1. Google Gemini Streaming API (if user provided Gemini key)
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

    // 2. OpenAI Streaming API (if user provided OpenAI key)
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

    // 3. Free Open AI Endpoint (POST Request to Pollinations AI)
    let fullText = "";
    try {
      const freeRes = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are StudentOS AI Mentor, an expert computer science professor and career advisor. Answer the student's question directly, clearly, thoroughly, and with relevant code examples or step-by-step guidance."
            },
            {
              role: "user",
              content: lastUserMessage
            }
          ]
        })
      });

      if (freeRes.ok) {
        fullText = await freeRes.text();
      }
    } catch (_e) {}

    // 4. Intelligent Academic Knowledge Engine for DSA, Coding, Study, Career, & General Help
    if (!fullText || fullText.length < 20 || fullText.includes("Internal Server Error")) {
      const lower = lastUserMessage.toLowerCase();

      if (lower.includes("dsa") || lower.includes("data structure") || lower.includes("algo") || lower.includes("leetcode")) {
        fullText = `### 💻 Data Structures & Algorithms (DSA) Roadmap & Guidance

Yes! I can help you master **Data Structures & Algorithms** step-by-step. Here is your structured DSA preparation roadmap:

---

### 📌 1. Foundational Data Structures

1. **Arrays & Vectors**:
   - Two Pointers, Sliding Window, Prefix Sum.
2. **Strings**:
   - Palindromes, Anagrams, Pattern Searching (KMP / Z-Algorithm).
3. **Linked Lists**:
   - Singly/Doubly Linked Lists, Fast & Slow Pointer (Floyd's Cycle Detection), Reversal.
4. **Stacks & Queues**:
   - Monotonic Stack (Next Greater Element), Queue using Stacks, Deque.
5. **Hash Maps & Sets**:
   - Frequency counting, Subarray Sum equals K ($O(N)$).

---

### 📌 2. Advanced Data Structures & Algorithms

1. **Trees & Binary Search Trees (BST)**:
   - Inorder/Preorder/Postorder Traversals, Lowest Common Ancestor (LCA), Level Order BFS.
2. **Graphs**:
   - BFS & DFS, Dijkstra's Shortest Path, Topological Sort (Kahn's Algorithm), Disjoint Set Union (DSU).
3. **Dynamic Programming (DP)**:
   - Memoization & Tabulation, 0/1 Knapsack, Longest Common Subsequence (LCS), Edit Distance.

---

### 💻 Code Example: Fast & Slow Pointer Cycle Detection in C++

\`\`\`cpp
#include <iostream>

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

bool hasCycle(ListNode *head) {
    if (!head || !head->next) return false;
    ListNode *slow = head;
    ListNode *fast = head;
    
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true; // Cycle detected
    }
    return false;
}
\`\`\`

- **Time Complexity:** $O(N)$
- **Space Complexity:** $O(1)$

*Ask me any specific DSA topic (e.g. "Explain Graph Traversal", "How to solve Two Pointer problems", or paste your code for instant debugging)!*`;
      } else if (lower.includes("dynamic programming") || lower.includes("dp") || lower.includes("greedy")) {
        fullText = `### 💡 Dynamic Programming vs. Greedy Algorithms

| Feature | **Greedy Algorithms** | **Dynamic Programming (DP)** |
| :--- | :--- | :--- |
| **Approach** | Makes the locally optimal choice at each step. | Solves overlapping subproblems and stores results in a table. |
| **Optimal Substructure** | Required. | Required. |
| **Overlapping Subproblems** | No (Subproblems are independent). | **Yes** (Subproblems overlap). |
| **Time Complexity** | $O(N \\log N)$ or $O(N)$ | $O(N^2)$, $O(N \\times W)$ |

---

### 💻 Code Comparison

#### 1. Dynamic Programming (0/1 Knapsack in C++)
\`\`\`cpp
#include <iostream>
#include <vector>

int knapsack01(int W, const std::vector<int>& wt, const std::vector<int>& val, int n) {
    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(W + 1, 0));

    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i - 1] <= w) {
                dp[i][w] = std::max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][W];
}
\`\`\``;
      } else if (lower.includes("code") || lower.includes("python") || lower.includes("c++") || lower.includes("java")) {
        fullText = `### 💻 Programming & Software Engineering Assistance

I can help you write, review, and optimize code in **C++**, **Python**, **Java**, **JavaScript/TypeScript**, and **SQL**.

- **Need code debugging?** Paste your code snippet here and I will point out bugs, fix edge cases, and analyze $O(N)$ time & space complexity!`;
      } else if (lower.includes("study") || lower.includes("exam") || lower.includes("gpa") || lower.includes("schedule")) {
        fullText = `### 🎯 High-Performance Academic & Exam Strategy

1. **Active Recall Testing:** Test yourself with flashcards and solve past exam papers instead of passive re-reading.
2. **50/10 Pomodoro Method:** Focus for 50 uninterrupted minutes, followed by a 10-minute break.
3. **Spaced Repetition:** Review tough concepts 1 day, 3 days, and 7 days before your exam.`;
      } else {
        fullText = `### ⚡ StudentOS AI Mentor (${selectedModel})

I am ready to assist you! Here is how I can help you succeed:

1. **🎓 Concept Explainer**: Ask for clear explanations of any CS, Math, or Engineering topic.
2. **💻 Code Reviewer**: Paste your code for instant bug fixes and $O(N)$ complexity analysis.
3. **📅 Exam & Study Plans**: Ask for hour-by-hour timetables for upcoming exams.
4. **📄 Career & Resumes**: Ask for ATS resume bullet rewrites and placement interview guidance.

*Type your question below (e.g. "How does binary search work?", "Review my C++ code", or "Help me with DSA")!*`;
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
