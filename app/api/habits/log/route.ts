import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

// Toggle a habit log for today
export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUser();
    const { habitId } = await req.json();

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Verify habit belongs to user
    const habit = await db.habit.findUnique({ where: { id: habitId } });
    if (!habit || habit.userId !== userId) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const existing = await db.habitLog.findUnique({
      where: { habitId_date: { habitId, date: today } },
    });

    if (existing) {
      await db.habitLog.delete({ where: { id: existing.id } });
      return NextResponse.json({ done: false, habitId });
    } else {
      await db.habitLog.create({
        data: { habitId, userId, date: today, done: true },
      });
      return NextResponse.json({ done: true, habitId });
    }
  } catch {
    return NextResponse.json({ error: "Failed to toggle habit log" }, { status: 500 });
  }
}
