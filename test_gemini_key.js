require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

async function testGeminiKey() {
  console.log("Testing Google AI Studio (Gemini) API Key...");
  if (!key) {
    console.error("GEMINI_API_KEY missing");
    return;
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const res = await fetch(url);
    console.log("Response Status:", res.status, res.statusText);
    if (res.ok) {
      const data = await res.json();
      console.log(`>>> SUCCESS! Connected to Google AI Studio! ${data.models?.length || 0} models available.`);
    } else {
      const errText = await res.text();
      console.error(`Google AI Studio Error (${res.status}):`, errText);
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

testGeminiKey();
