import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getOrCreateUser();
    const { id } = await params;

    const habit = await db.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.habit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}
