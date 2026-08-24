import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";
import { projectSchema } from "@/lib/validations/project.schema";

export async function GET() {
  try {
    const userId = await getOrCreateUser();
    const projects = await db.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch {
    return NextResponse.json(DEFAULT_PROJECTS);
  }
}

const DEFAULT_PROJECTS = [
  { id: "p1", name: "StudentOS", description: "Personal Operating System for B-Tech CS Students", stack: "Next.js, Prisma, Tailwind", status: "IN_PROGRESS", progress: 65, github: "", liveUrl: "" },
  { id: "p2", name: "Voxnet Caller", description: "Real-time WebRTC calling platform", stack: "React, WebRTC, Node.js", status: "COMPLETED", progress: 100, github: "", liveUrl: "" }
];

export async function POST(req: Request) {
  try {
    const userId = await getOrCreateUser();
    const body = await req.json();
    const data = projectSchema.parse(body);

    const project = await db.project.create({
      data: { ...data, userId },
    });

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
