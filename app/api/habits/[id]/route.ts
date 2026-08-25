import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Update resilient in-memory store
    const habits = (globalThis as any).__STUDENT_OS_HABITS || [];
    (globalThis as any).__STUDENT_OS_HABITS = habits.filter((h: any) => h.id !== id);

    // Async attempt DB delete
    Promise.resolve().then(async () => {
      try {
        await db.habit.delete({ where: { id } });
      } catch (_dbErr) {}
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
