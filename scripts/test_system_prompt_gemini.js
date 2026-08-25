require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

async function testGeminiRoleSequence() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

  // Improper sequence: two consecutive 'user' roles
  const badContents = [
    { role: "user", parts: [{ text: "[SYSTEM INSTRUCTIONS]: You are a helpful assistant." }] },
    { role: "user", parts: [{ text: "HELLO" }] }
  ];

  console.log("Testing consecutive user roles...");
  const badRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: badContents })
  });
  console.log("Bad Contents Status:", badRes.status, badRes.statusText);
  if (!badRes.ok) {
    console.error("Bad contents error:", await badRes.text());
  }

  // Proper sequence using system_instruction field in Google Gemini API payload:
  const goodBody = {
    system_instruction: {
      parts: [{ text: "You are a helpful assistant." }]
    },
    contents: [
      { role: "user", parts: [{ text: "HELLO" }] }
    ]
  };

  console.log("\nTesting proper system_instruction parameter...");
  const goodRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goodBody)
  });
  console.log("Good Body Status:", goodRes.status, goodRes.statusText);
  if (goodRes.ok) {
    const data = await goodRes.json();
    console.log(">>> SUCCESS! Gemini Output:", data.candidates?.[0]?.content?.parts?.[0]?.text);
  }
}

testGeminiRoleSequence();
