import { NextRequest, NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const userId = await getOrCreateUser();

    // 1. Fetch pending high priority tasks
    const pendingTasks = await db.task.findMany({
      where: { userId, done: false },
      take: 3,
      orderBy: { priority: "asc" },
    });

    // 2. Fetch habits
    const habits = await db.habit.findMany({
      where: { userId },
      take: 3,
    });

    // 3. Assemble dynamic notification items
    const notifications = [];

    if (pendingTasks.length > 0) {
      notifications.push({
        id: "task-due-1",
        title: `Task Due: ${pendingTasks[0].title}`,
        body: `Priority: ${pendingTasks[0].priority} • Category: ${pendingTasks[0].category}`,
        time: "Just now",
        read: false,
        type: "task",
      });
    }

    if (habits.length > 0) {
      notifications.push({
        id: "habit-rem-1",
        title: `Habit Tracker: ${habits[0].emoji} ${habits[0].name}`,
        body: "Keep your daily habit streak active! 🔥",
        time: "10m ago",
        read: false,
        type: "habit",
      });
    }

    notifications.push({
      id: "ai-mentor-tip",
      title: "AI Mentor Copilot Ready 🤖",
      body: "Ask AI Mentor to build a 7-day study plan based on your pending tasks.",
      time: "1h ago",
      read: true,
      type: "ai",
    });

    return NextResponse.json(notifications);
  } catch (_e) {
    return NextResponse.json([
      { id: "1", title: "StudentOS Active ⚡", body: "Welcome to your command center", time: "Now", read: false },
    ]);
  }
}
