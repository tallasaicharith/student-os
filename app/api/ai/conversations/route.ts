import { NextRequest, NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const conversation = await db.aIConversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!conversation || conversation.userId !== userId) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      return NextResponse.json(conversation);
    }

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

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const { id, title } = await req.json();

    if (!id || !title) {
      return NextResponse.json({ error: "ID and title are required" }, { status: 400 });
    }

    const conversation = await db.aIConversation.findUnique({ where: { id } });
    if (!conversation || conversation.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.aIConversation.update({
      where: { id },
      data: { title: title.trim() },
    });

    return NextResponse.json(updated);
  } catch (_e) {
    return NextResponse.json({ error: "Failed to rename conversation" }, { status: 500 });
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
