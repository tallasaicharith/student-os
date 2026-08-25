import { NextRequest, NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";
import { maskApiKey } from "@/lib/ai/security";

export async function GET() {
  try {
    const userId = await getOrCreateUser();

    let config = await db.aIProviderConfig.findUnique({ where: { userId } });

    if (!config) {
      config = await db.aIProviderConfig.create({
        data: { userId },
      });
    }

    return NextResponse.json({
      id: config.id,
      defaultProvider: config.defaultProvider,
      defaultModel: config.defaultModel,
      autoRouting: config.autoRouting,
      streaming: config.streaming,
      maskedKeys: {
        gemini: maskApiKey(config.geminiKey || process.env.GEMINI_API_KEY),
        openai: maskApiKey(config.openaiKey || process.env.OPENAI_API_KEY),
        claude: maskApiKey(config.anthropicKey || process.env.ANTHROPIC_API_KEY),
        groq: maskApiKey(config.groqKey || process.env.GROQ_API_KEY),
      },
    });
  } catch (_e) {
    return NextResponse.json({
      defaultProvider: "gemini",
      defaultModel: "gemini-2.0-flash",
      autoRouting: true,
      streaming: true,
      maskedKeys: {
        gemini: maskApiKey(process.env.GEMINI_API_KEY),
        openai: maskApiKey(process.env.OPENAI_API_KEY),
        claude: maskApiKey(process.env.ANTHROPIC_API_KEY),
        groq: maskApiKey(process.env.GROQ_API_KEY),
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const body = await req.json();
    const {
      geminiKey,
      openaiKey,
      anthropicKey,
      groqKey,
      defaultProvider = "gemini",
      defaultModel = "gemini-2.0-flash",
      autoRouting = true,
      streaming = true,
    } = body;

    const dataToUpdate: Record<string, unknown> = {
      defaultProvider,
      defaultModel,
      autoRouting,
      streaming,
    };

    if (geminiKey !== undefined) dataToUpdate.geminiKey = geminiKey.trim() || null;
    if (openaiKey !== undefined) dataToUpdate.openaiKey = openaiKey.trim() || null;
    if (anthropicKey !== undefined) dataToUpdate.anthropicKey = anthropicKey.trim() || null;
    if (groqKey !== undefined) dataToUpdate.groqKey = groqKey.trim() || null;

    const config = await db.aIProviderConfig.upsert({
      where: { userId },
      update: dataToUpdate,
      create: {
        userId,
        ...dataToUpdate,
      },
    });

    return NextResponse.json({
      success: true,
      defaultProvider: config.defaultProvider,
      defaultModel: config.defaultModel,
      maskedKeys: {
        gemini: maskApiKey(config.geminiKey || process.env.GEMINI_API_KEY),
        openai: maskApiKey(config.openaiKey || process.env.OPENAI_API_KEY),
        claude: maskApiKey(config.anthropicKey || process.env.ANTHROPIC_API_KEY),
        groq: maskApiKey(config.groqKey || process.env.GROQ_API_KEY),
      },
    });
  } catch (_e) {
    return NextResponse.json({ error: "Failed to update AI settings" }, { status: 500 });
  }
}
