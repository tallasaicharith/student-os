require('dotenv').config();

async function testRouteHandler() {
  console.log("=== TESTING LIVE GEMINI RESPONSES FROM /api/ai/chat ===");

  const payload = {
    messages: [{ role: "user", content: "WHAT IS MY SCHEDULE TODAY" }],
    mode: "general"
  };

  try {
    const res = await fetch("http://localhost:3000/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Response Status:", res.status, res.statusText);
    const text = await res.text();
    console.log("\n>>> LIVE GOOGLE GEMINI RESPONSE:\n", text);
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

testRouteHandler();
