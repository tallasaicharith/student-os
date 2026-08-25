require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

async function testStream() {
  console.log("Testing Google AI Studio Gemini 2.5 Flash...");
  if (!key) {
    console.error("GEMINI_API_KEY missing");
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: "Hello! Please reply in 1 sentence confirming you are Gemini 2.5 Flash live via Google AI Studio." }]
        }]
      })
    });

    console.log("Status:", res.status, res.statusText);
    const data = await res.json();
    console.log("Answer:", data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

testStream();
