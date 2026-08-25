import { NextResponse } from "next/server";

export async function GET() {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const anthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY);
  const groqConfigured = Boolean(process.env.GROQ_API_KEY || process.env.DEEPSEEK_API_KEY);

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    defaultProvider: process.env.DEFAULT_AI_PROVIDER || "gemini",
    defaultModel: process.env.DEFAULT_AI_MODEL || "gemini-2.0-flash",
    providers: {
      gemini: geminiConfigured ? "configured" : "not_configured",
      openai: openaiConfigured ? "configured" : "not_configured",
      claude: anthropicConfigured ? "configured" : "not_configured",
      groq: groqConfigured ? "configured" : "free_fallback_active",
    },
  });
}
