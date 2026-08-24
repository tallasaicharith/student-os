import { NextResponse } from "next/server";
import { db, getOrCreateDevUser } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getOrCreateDevUser();
    const today = new Date().toISOString().slice(0, 10);

    const habits = await db.habit.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      include: {
        logs: {
          where: { date: { gte: new Date(today), lte: new Date(today + "T23:59:59Z") } },
        },
      },
    });

    return NextResponse.json(habits);
  } catch {
    return NextResponse.json(DEFAULT_HABITS);
  }
}

const DEFAULT_HABITS = [
  { id: "h1", name: "Wake up at 4:00 AM", emoji: "🌅", order: 0, logs: [] },
  { id: "h2", name: "Gym Workout", emoji: "🏋️", order: 1, logs: [] },
  { id: "h3", name: "Drink 3L Water", emoji: "💧", order: 2, logs: [] },
  { id: "h4", name: "Gita Reading", emoji: "📖", order: 3, logs: [] },
  { id: "h5", name: "LeetCode Daily", emoji: "💻", order: 4, logs: [] },
  { id: "h6", name: "Protein Target", emoji: "🥩", order: 5, logs: [] },
  { id: "h7", name: "20 Pages Reading", emoji: "📚", order: 6, logs: [] },
  { id: "h8", name: "7 Hours Sleep", emoji: "😴", order: 7, logs: [] }
];
