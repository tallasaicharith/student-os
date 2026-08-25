import { NextRequest, NextResponse } from "next/server";
import { aiRegistry } from "@/lib/ai/registry";
import { ProviderName } from "@/lib/ai/types";
import { db, getOrCreateUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider) {
      return NextResponse.json({ success: false, message: "Provider name is required" }, { status: 400 });
    }

    let keyToTest = apiKey ? apiKey.trim() : "";

    // If keyToTest is empty, load saved key from DB
    if (!keyToTest) {
      try {
        const userId = await getOrCreateUser();
        const config = await db.aIProviderConfig.findUnique({ where: { userId } });
        if (config) {
          if (provider === "gemini") keyToTest = config.geminiKey || "";
          else if (provider === "openai") keyToTest = config.openaiKey || "";
          else if (provider === "claude") keyToTest = config.anthropicKey || "";
          else if (provider === "groq") keyToTest = config.groqKey || "";
        }
      } catch (_e) {}
    }

    const adapter = aiRegistry.getProvider(provider as ProviderName);
    const result = await adapter.testConnection(keyToTest);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err instanceof Error ? err.message : "Connection failed",
    });
  }
}
