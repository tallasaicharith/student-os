require('dotenv').config();

const key = process.env.OPENAI_API_KEY;

async function testKey() {
  console.log("Testing OpenAI API Key connection...");
  if (!key) {
    console.error("OPENAI_API_KEY not found in .env");
    return;
  }
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.ok) {
      console.log(">>> SUCCESS! OpenAI Key is valid and active!");
      const data = await res.json();
      console.log(`Available OpenAI Models: ${data.data.length} models fetched.`);
    } else {
      const err = await res.text();
      console.error(`OpenAI Error (${res.status}): ${err}`);
    }
  } catch (e) {
    console.error("Network Error:", e.message);
  }
}
testKey();
