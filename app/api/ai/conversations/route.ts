import { NextRequest, NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getOrCreateUser();
    const conversations = await db.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (_e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const { title = "New Conversation", provider = "gemini", model = "gemini-2.0-flash", mode = "general" } = await req.json();

    const conversation = await db.aIConversation.create({
      data: {
        userId,
        title,
        selectedProvider: provider,
        selectedModel: model,
        mode,
      },
    });

    return NextResponse.json(conversation);
  } catch (_e) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const conversation = await db.aIConversation.findUnique({ where: { id } });
    if (!conversation || conversation.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.aIConversation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (_e) {
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
