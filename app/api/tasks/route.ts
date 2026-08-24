import { NextRequest, NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";
import { taskSchema } from "@/lib/validations/task.schema";

export async function GET(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    
    // Parse date query parameter, default to today's date
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const dateObj = new Date(dateStr);
    
    const startOfDay = new Date(dateObj);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dateObj);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const tasks = await db.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json(DEFAULT_TASKS);
  }
}

const DEFAULT_TASKS = [
  { id: "t1", title: "Wake up at 4:00 AM", category: "PERSONAL", priority: "HIGH", done: false },
  { id: "t2", title: "Perform Gym workout (Chest + Triceps)", category: "FITNESS", priority: "HIGH", done: false },
  { id: "t3", title: "Drink 500ml water immediately after waking up", category: "PERSONAL", priority: "MEDIUM", done: false },
  { id: "t4", title: "Read Bhagavad Gita Chapter 2, Verse 47", category: "STUDY", priority: "MEDIUM", done: false },
  { id: "t5", title: "Attend B-Tech Lectures: Data Structures, AI", category: "STUDY", priority: "HIGH", done: false },
  { id: "t6", title: "Solve 5 LeetCode Dynamic Programming challenges", category: "PROJECT", priority: "HIGH", done: false },
  { id: "t7", title: "Read 20 pages of Grokking Algorithms", category: "STUDY", priority: "MEDIUM", done: false }
];

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
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
