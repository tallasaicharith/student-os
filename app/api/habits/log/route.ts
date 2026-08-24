import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

// Toggle a habit log for today
export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUser();
    const { habitId } = await req.json();
    const today = new Date(new Date().toISOString().slice(0, 10));

    const existing = await db.habitLog.findUnique({
      where: { habitId_date: { habitId, date: today } },
    });

    if (existing) {
      await db.habitLog.delete({ where: { id: existing.id } });
      return NextResponse.json({ done: false });
    } else {
      await db.habitLog.create({
        data: { habitId, userId, date: today, done: true },
      });
      return NextResponse.json({ done: true });
    }
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
