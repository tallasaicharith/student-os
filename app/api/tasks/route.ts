import { NextRequest, NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";
import { taskSchema } from "@/lib/validations/task.schema";
import { TaskCategory, Priority } from "@prisma/client";

const INITIAL_TASK_SEEDS = [
  { id: "t-1", title: "Complete System Architecture & AI Pipeline for StudentOS", category: TaskCategory.PROJECT, priority: Priority.HIGH, done: true, dueDate: new Date().toISOString() },
  { id: "t-2", title: "Implement Google Gemini 2.5 Flash Live Streaming", category: TaskCategory.PROJECT, priority: Priority.HIGH, done: true, dueDate: new Date().toISOString() },
  { id: "t-3", title: "Prepare Slide Deck for Final Project Presentation", category: TaskCategory.STUDY, priority: Priority.HIGH, done: false, dueDate: new Date().toISOString() },
  { id: "t-4", title: "Solve 5 LeetCode Graph Traversal Challenges", category: TaskCategory.STUDY, priority: Priority.MEDIUM, done: false, dueDate: new Date().toISOString() },
  { id: "t-5", title: "Perform Morning Gym Workout (Chest + Triceps)", category: TaskCategory.FITNESS, priority: Priority.HIGH, done: true, dueDate: new Date().toISOString() },
  { id: "t-6", title: "Read Bhagavad Gita Chapter 2, Verse 47", category: TaskCategory.PERSONAL, priority: Priority.MEDIUM, done: true, dueDate: new Date().toISOString() }
];

(globalThis as any).__STUDENT_OS_TASKS = (globalThis as any).__STUDENT_OS_TASKS || [...INITIAL_TASK_SEEDS];

export async function GET(_req: NextRequest) {
  try {
    const userId = await getOrCreateUser();

    let tasks = await db.task.findMany({
      where: { userId },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    });

    if (tasks.length === 0) {
      await db.task.createMany({
        data: INITIAL_TASK_SEEDS.map((t) => ({
          title: t.title,
          category: t.category,
          priority: t.priority,
          done: t.done,
          userId,
          dueDate: new Date(),
        })),
      });

      tasks = await db.task.findMany({
        where: { userId },
        orderBy: [{ done: "asc" }, { createdAt: "desc" }],
      });
    }

    if (tasks.length > 0) {
      (globalThis as any).__STUDENT_OS_TASKS = tasks;
      return NextResponse.json(tasks);
    }
  } catch (_e) {}

  return NextResponse.json((globalThis as any).__STUDENT_OS_TASKS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = taskSchema.parse(body);

    const currentTasks = (globalThis as any).__STUDENT_OS_TASKS || [];
    const newTask = {
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: data.title,
      category: data.category || TaskCategory.STUDY,
      priority: data.priority || Priority.MEDIUM,
      done: false,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    currentTasks.unshift(newTask);
    (globalThis as any).__STUDENT_OS_TASKS = currentTasks;

    // Async attempt DB sync
    Promise.resolve().then(async () => {
      try {
        const userId = await getOrCreateUser();
        await db.task.create({
          data: {
            ...data,
            userId,
            dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
          },
        });
      } catch (_dbErr) {}
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (_e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
