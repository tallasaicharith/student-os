import { NextRequest, NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";
import { taskSchema } from "@/lib/validations/task.schema";
import { TaskCategory, Priority } from "@prisma/client";

const INITIAL_TASK_SEEDS: { title: string; category: TaskCategory; priority: Priority }[] = [
  { title: "Wake up at 4:00 AM", category: TaskCategory.PERSONAL, priority: Priority.HIGH },
  { title: "Perform Gym workout (Chest + Triceps)", category: TaskCategory.FITNESS, priority: Priority.HIGH },
  { title: "Drink 500ml water immediately after waking up", category: TaskCategory.PERSONAL, priority: Priority.MEDIUM },
  { title: "Read Bhagavad Gita Chapter 2, Verse 47", category: TaskCategory.STUDY, priority: Priority.MEDIUM },
  { title: "Attend B-Tech Lectures: Data Structures, AI", category: TaskCategory.STUDY, priority: Priority.HIGH },
  { title: "Solve 5 LeetCode Dynamic Programming challenges", category: TaskCategory.PROJECT, priority: Priority.HIGH },
  { title: "Read 20 pages of Grokking Algorithms", category: TaskCategory.STUDY, priority: Priority.MEDIUM }
];

export async function GET(_req: NextRequest) {
  try {
    const userId = await getOrCreateUser();

    // 1. Check if user already has tasks in Database
    let tasks = await db.task.findMany({
      where: { userId },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    });

    // 2. Auto-seed real database records if 0 tasks exist
    if (tasks.length === 0) {
      await db.task.createMany({
        data: INITIAL_TASK_SEEDS.map((t) => ({
          ...t,
          userId,
          dueDate: new Date(),
        })),
      });

      tasks = await db.task.findMany({
        where: { userId },
        orderBy: [{ done: "asc" }, { createdAt: "desc" }],
      });
    }

    return NextResponse.json(tasks);
  } catch (_e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUser();
    const body = await req.json();
    const data = taskSchema.parse(body);

    const task = await db.task.create({
      data: { 
        ...data, 
        userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date() 
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (_e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
