import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getOrCreateUser();
    const { id } = await params;
    const body = await req.json();

    const task = await db.task.findUnique({ where: { id } });
    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.task.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getOrCreateUser();
    const { id } = await params;

    const task = await db.task.findUnique({ where: { id } });
    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
