require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;

async function testOpenAIStream() {
  console.log("=== DEBUGGING OPENAI API STREAM ===");
  console.log("Using API Key:", apiKey ? `${apiKey.slice(0, 15)}...${apiKey.slice(-5)}` : "MISSING");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        stream: false,
        messages: [{ role: "user", content: "Hello! Are you ChatGPT?" }],
      }),
    });

    console.log("Response Status:", res.status, res.statusText);
    const data = await res.json();
    console.log("API Response Body:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Exception:", err);
  }
}

testOpenAIStream();
