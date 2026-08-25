import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

const INITIAL_HABIT_SEEDS = [
  { name: "Wake up at 4:00 AM", emoji: "🌅", order: 0 },
  { name: "Gym Workout", emoji: "🏋️", order: 1 },
  { name: "Drink 3L Water", emoji: "💧", order: 2 },
  { name: "Gita Reading", emoji: "📖", order: 3 },
  { name: "LeetCode Daily", emoji: "💻", order: 4 },
  { name: "Protein Target", emoji: "🥩", order: 5 },
  { name: "20 Pages Reading", emoji: "📚", order: 6 },
  { name: "7 Hours Sleep", emoji: "😴", order: 7 }
];

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

    // Auto-seed real PostgreSQL database records if 0 habits exist
    if (habits.length === 0) {
      await db.habit.createMany({
        data: INITIAL_HABIT_SEEDS.map((h) => ({
          ...h,
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

    return NextResponse.json(habits);
  } catch (_e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUser();
    const { name, emoji = "⚡" } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const count = await db.habit.count({ where: { userId } });
    const habit = await db.habit.create({
      data: {
        userId,
        name: name.trim(),
        emoji: emoji.trim() || "⚡",
        order: count,
      },
      include: { logs: true },
    });

    return NextResponse.json(habit);
  } catch (_e) {
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}
