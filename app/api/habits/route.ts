import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

const INITIAL_HABIT_SEEDS = [
  { id: "h-1", name: "Wake up at 4:00 AM", emoji: "🌅", order: 0, logs: [] },
  { id: "h-2", name: "Gym Workout", emoji: "🏋️", order: 1, logs: [] },
  { id: "h-3", name: "Drink 3L Water", emoji: "💧", order: 2, logs: [] },
  { id: "h-4", name: "Gita Reading", emoji: "📖", order: 3, logs: [] },
  { id: "h-5", name: "LeetCode Daily", emoji: "💻", order: 4, logs: [] },
  { id: "h-6", name: "Protein Target", emoji: "🥩", order: 5, logs: [] },
  { id: "h-7", name: "20 Pages Reading", emoji: "📚", order: 6, logs: [] },
  { id: "h-8", name: "7 Hours Sleep", emoji: "😴", order: 7, logs: [] }
];

// Global resilient fallback store
(globalThis as any).__STUDENT_OS_HABITS = (globalThis as any).__STUDENT_OS_HABITS || [...INITIAL_HABIT_SEEDS];

export async function GET() {
  try {
    const userId = await getOrCreateUser();
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    let habits = await db.habit.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      include: {
        logs: {
          where: { date: { gte: startOfToday, lte: endOfToday } },
        },
      },
    });

    if (habits.length === 0) {
      await db.habit.createMany({
        data: INITIAL_HABIT_SEEDS.map((h) => ({
          name: h.name,
          emoji: h.emoji,
          order: h.order,
          userId,
        })),
      });

      habits = await db.habit.findMany({
        where: { userId },
        orderBy: { order: "asc" },
        include: {
          logs: {
            where: { date: { gte: startOfToday, lte: endOfToday } },
          },
        },
      });
    }

    if (habits.length > 0) {
      (globalThis as any).__STUDENT_OS_HABITS = habits;
      return NextResponse.json(habits);
    }
  } catch (_e) {}

  // Return resilient fallback habits store
  return NextResponse.json((globalThis as any).__STUDENT_OS_HABITS);
}

export async function POST(req: Request) {
  try {
    const { name, emoji = "⚡" } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const currentHabits = (globalThis as any).__STUDENT_OS_HABITS || [];
    const newHabit = {
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      emoji: emoji.trim() || "⚡",
      order: currentHabits.length,
      logs: [],
      createdAt: new Date().toISOString(),
    };

    currentHabits.push(newHabit);
    (globalThis as any).__STUDENT_OS_HABITS = currentHabits;

    // Async attempt DB sync in background
    Promise.resolve().then(async () => {
      try {
        const userId = await getOrCreateUser();
        const count = await db.habit.count({ where: { userId } });
        await db.habit.create({
          data: {
            userId,
            name: newHabit.name,
            emoji: newHabit.emoji,
            order: count,
          },
        });
      } catch (_dbErr) {}
    });

    return NextResponse.json(newHabit);
  } catch (_e) {
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}
