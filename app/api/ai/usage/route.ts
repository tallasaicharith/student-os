import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getOrCreateUser();

    const usages = await db.aIUsage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const totalRequests = usages.length;
    const avgLatencyMs = totalRequests > 0
      ? Math.round(usages.reduce((acc, u) => acc + u.latencyMs, 0) / totalRequests)
      : 0;

    const providerCounts: Record<string, number> = {};
    const modelCounts: Record<string, number> = {};
    const modeCounts: Record<string, number> = {};

    usages.forEach((u) => {
      providerCounts[u.provider] = (providerCounts[u.provider] || 0) + 1;
      modelCounts[u.model] = (modelCounts[u.model] || 0) + 1;
      modeCounts[u.mode] = (modeCounts[u.mode] || 0) + 1;
    });

    return NextResponse.json({
      totalRequests,
      avgLatencyMs,
      providerCounts,
      modelCounts,
      modeCounts,
      recent: usages.slice(0, 10),
    });
  } catch (_e) {
    return NextResponse.json({
      totalRequests: 0,
      avgLatencyMs: 0,
      providerCounts: {},
      modelCounts: {},
      modeCounts: {},
      recent: [],
    });
  }
}
