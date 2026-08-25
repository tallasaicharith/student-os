import { NextRequest, NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";
import { maskApiKey } from "@/lib/ai/security";

export async function GET() {
  try {
    const userId = await getOrCreateUser();

    let config = await db.aIProviderConfig.findUnique({ where: { userId } });

    if (!config) {
      // Check if there is any existing config in DB to reuse
      const globalConfig = await db.aIProviderConfig.findFirst({
        where: { geminiKey: { not: null } },
        orderBy: { updatedAt: "desc" },
      });

      if (globalConfig) {
        config = globalConfig;
      } else {
        config = await db.aIProviderConfig.create({
          data: { userId },
        });
      }
    }

    return NextResponse.json({
      id: config.id,
      defaultProvider: config.defaultProvider,
      defaultModel: config.defaultModel,
      autoRouting: config.autoRouting,
      streaming: config.streaming,
      rawKeys: {
        gemini: config.geminiKey || "",
        openai: config.openaiKey || "",
        claude: config.anthropicKey || "",
        groq: config.groqKey || "",
      },
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
      rawKeys: { gemini: "", openai: "", claude: "", groq: "" },
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

    // ONLY update keys if a non-empty string is explicitly provided
    if (geminiKey && typeof geminiKey === "string" && geminiKey.trim().length > 0) {
      dataToUpdate.geminiKey = geminiKey.trim();
    }
    if (openaiKey && typeof openaiKey === "string" && openaiKey.trim().length > 0) {
      dataToUpdate.openaiKey = openaiKey.trim();
    }
    if (anthropicKey && typeof anthropicKey === "string" && anthropicKey.trim().length > 0) {
      dataToUpdate.anthropicKey = anthropicKey.trim();
    }
    if (groqKey && typeof groqKey === "string" && groqKey.trim().length > 0) {
      dataToUpdate.groqKey = groqKey.trim();
    }

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
      rawKeys: {
        gemini: config.geminiKey || "",
        openai: config.openaiKey || "",
        claude: config.anthropicKey || "",
        groq: config.groqKey || "",
      },
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
