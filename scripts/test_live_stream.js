require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

async function testStreamFormat() {
  console.log("=== TESTING LIVE GEMINI 2.5 FLASH SSE STREAMING ===");
  console.log("Key:", key ? `${key.slice(0, 10)}...` : "MISSING");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${key}`;

  const contents = [
    {
      role: "user",
      parts: [{ text: "Introduce yourself in 2 lines. Confirm you are Gemini 2.5 Flash live via Google AI Studio API." }]
    }
  ];

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    console.log("Status:", res.status, res.statusText);
    const text = await res.text();
    console.log("Raw Stream Output (first 300 chars):", text.slice(0, 300));
  } catch (err) {
    console.error("Error:", err);
  }
}

testStreamFormat();
