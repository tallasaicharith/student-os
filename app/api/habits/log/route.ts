import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

// Toggle a habit log for today
export async function POST(req: Request) {
  try {
    const { habitId } = await req.json();

    if (!habitId) {
      return NextResponse.json({ error: "habitId is required" }, { status: 400 });
    }

    let isDone = false;
    const habits = (globalThis as any).__STUDENT_OS_HABITS || [];
    const habitIndex = habits.findIndex((h: any) => h.id === habitId);

    if (habitIndex !== -1) {
      const targetHabit = habits[habitIndex];
      const hasLog = targetHabit.logs && targetHabit.logs.length > 0;
      if (hasLog) {
        targetHabit.logs = [];
        isDone = false;
      } else {
        targetHabit.logs = [{ id: `log-${Date.now()}`, date: new Date().toISOString(), done: true }];
        isDone = true;
      }
      habits[habitIndex] = targetHabit;
      (globalThis as any).__STUDENT_OS_HABITS = habits;
    }

    // Async attempt DB sync
    Promise.resolve().then(async () => {
      try {
        const userId = await getOrCreateUser();
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const existing = await db.habitLog.findUnique({
          where: { habitId_date: { habitId, date: today } },
        });

        if (existing) {
          await db.habitLog.delete({ where: { id: existing.id } });
        } else {
          await db.habitLog.create({
            data: { habitId, userId, date: today, done: true },
          });
        }
      } catch (_dbErr) {}
    });

    return NextResponse.json({ done: isDone, habitId });
  } catch (_e) {
    return NextResponse.json({ done: true, habitId: "" });
  }
}
