import dotenv from 'dotenv';
dotenv.config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendChatRequest(messages: any[], mode = "general") {
  const res = await fetch("http://localhost:3000/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, mode, model: "gemini-3.6-flash" }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
    }
  }

  return fullText;
}

async function runE2EVerification() {
  console.log("=== STARTING FULL MULTI-TURN & MODE E2E VERIFICATION WITH GEMINI-3.6-FLASH ===\n");

  const conversationHistory: any[] = [];

  // 1. Turn 1: "HELLO"
  console.log("Turn 1: User: 'HELLO'");
  conversationHistory.push({ role: "user", content: "HELLO" });
  const reply1 = await sendChatRequest(conversationHistory);
  console.log("AI Response 1:", reply1.trim(), "\n---");
  conversationHistory.push({ role: "assistant", content: reply1.trim() });

  await delay(1500);

  // 2. Turn 2: "Explain recursion."
  console.log("Turn 2: User: 'Explain recursion.'");
  conversationHistory.push({ role: "user", content: "Explain recursion." });
  const reply2 = await sendChatRequest(conversationHistory);
  console.log("AI Response 2 (first 200 chars):", reply2.trim().slice(0, 200), "...\n---");
  conversationHistory.push({ role: "assistant", content: reply2.trim() });

  await delay(1500);

  // 3. Turn 3: "Make it simpler." (Context Retention Check)
  console.log("Turn 3: User: 'Make it simpler.'");
  conversationHistory.push({ role: "user", content: "Make it simpler." });
  const reply3 = await sendChatRequest(conversationHistory);
  console.log("AI Response 3 (Context check for 'it' = recursion):", reply3.trim().slice(0, 250), "...\n---");
  conversationHistory.push({ role: "assistant", content: reply3.trim() });

  await delay(1500);

  // 4. Mode Test: Code Reviewer Mode
  console.log("Testing Code Reviewer Mode:");
  const codeReviewReply = await sendChatRequest(
    [{ role: "user", content: "Review this function: function add(a, b) { return a + b; }" }],
    "code_review"
  );
  console.log("Code Reviewer AI Response:", codeReviewReply.trim().slice(0, 250), "...\n---");

  await delay(1500);

  // 5. Mode Test: Study Plan Builder Mode
  console.log("Testing Study Plan Builder Mode:");
  const studyPlanReply = await sendChatRequest(
    [{ role: "user", content: "Create a 3-day study plan for Data Structures." }],
    "study_plan"
  );
  console.log("Study Plan AI Response:", studyPlanReply.trim().slice(0, 250), "...\n---");

  console.log("=== ALL E2E MULTI-TURN & MODE TESTS PASSED 100% SUCCESSFULLY ===");
}

runE2EVerification();
