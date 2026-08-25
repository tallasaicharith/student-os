import { NextRequest, NextResponse } from "next/server";
import { aiRegistry } from "@/lib/ai/registry";
import { ProviderName } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider) {
      return NextResponse.json({ success: false, message: "Provider name is required" }, { status: 400 });
    }

    const adapter = aiRegistry.getProvider(provider as ProviderName);
    const result = await adapter.testConnection(apiKey);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err instanceof Error ? err.message : "Connection failed",
    });
  }
}
