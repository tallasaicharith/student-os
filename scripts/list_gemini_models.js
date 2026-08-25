require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

async function listModels() {
  if (!key) {
    console.error("GEMINI_API_KEY is missing from .env");
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.models) {
    const supported = data.models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
    console.log(">>> Supported Models for generateContent:");
    console.log(supported);
  } else {
    console.log("Error response:", data);
  }
}

listModels();
