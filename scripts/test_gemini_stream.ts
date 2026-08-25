import dotenv from 'dotenv';
dotenv.config();

import { GeminiProvider } from '../lib/ai/providers/gemini';

async function testGeminiStream() {
  console.log("=== TESTING GEMINI PROVIDER STREAM DIRECTLY ===");
  const provider = new GeminiProvider();
  console.log("Using Key:", process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.slice(0, 15)}...` : "NONE");

  try {
    const stream = await provider.stream({
      provider: "gemini",
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: "HI" }],
      systemPrompt: "You are a helpful assistant.",
      apiKey: process.env.GEMINI_API_KEY
    });

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }
    console.log("Stream SUCCESS Output:\n", text);
  } catch (err: any) {
    console.error("Stream ERROR Status/Msg:", err.message);
  }
}

testGeminiStream();
