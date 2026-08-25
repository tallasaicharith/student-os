require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

async function debugGeminiHistory() {
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`;

  // Test 1: Empty text part
  const emptyPartContents = [
    { role: "user", parts: [{ text: "Hello" }] },
    { role: "model", parts: [{ text: "" }] },
    { role: "user", parts: [{ text: "WHAT MY SCHEDULE TODAY" }] }
  ];

  console.log("Testing Empty Text Part...");
  const res1 = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: emptyPartContents }),
  });
  console.log("Res 1 Status:", res1.status, res1.statusText);
  if (!res1.ok) console.log("Res 1 Error:", await res1.text());

  // Test 2: Consecutive 'model' or 'user' roles
  const consecutiveRoleContents = [
    { role: "user", parts: [{ text: "Hello" }] },
    { role: "user", parts: [{ text: "WHAT MY SCHEDULE TODAY" }] }
  ];

  console.log("\nTesting Consecutive User Roles...");
  const res2 = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: consecutiveRoleContents }),
  });
  console.log("Res 2 Status:", res2.status, res2.statusText);
  if (!res2.ok) console.log("Res 2 Error:", await res2.text());
}

debugGeminiHistory();
