import { NextResponse } from "next/server";
import { db, getOrCreateUser } from "@/lib/db";
import { projectSchema } from "@/lib/validations/project.schema";

const PRESENTATION_PROJECTS = [
  { id: "p1", name: "StudentOS - Academic Operating System", description: "All-in-one productivity suite for CS students featuring AI Mentor, Habit Tracker, Task Management, and System Analytics.", stack: "Next.js 16, TypeScript, Supabase, TailwindCSS, Gemini AI", status: "IN_PROGRESS", progress: 95, github: "https://github.com/tallasaicharith/student-os", liveUrl: "http://localhost:3000" },
  { id: "p2", name: "AI Resume & ATS Optimization Engine", description: "Automated resume scorer that extracts keywords, scores formatting against tech industry standards, and offers 90+ ATS rewrites.", stack: "Next.js, LangChain, Google AI Studio, pdf-parse", status: "COMPLETED", progress: 100, github: "https://github.com/tallasaicharith/student-os", liveUrl: "http://localhost:3000/internship" },
  { id: "p3", name: "Voxnet WebRTC Real-Time Calling Engine", description: "High-concurrency audio/video conferencing system with WebRTC peer mesh topology and Node.js signaling socket.", stack: "React, WebRTC, Socket.io, Node.js", status: "COMPLETED", progress: 100, github: "https://github.com/tallasaicharith/student-os", liveUrl: "" },
  { id: "p4", name: "Distributed Systems & Cloud Automation Pipeline", description: "Containerized microservices cluster deployed on AWS ECS with automated CI/CD pipeline and Prometheus metrics monitoring.", stack: "Docker, Kubernetes, AWS, Prometheus, Terraform", status: "IN_PROGRESS", progress: 85, github: "https://github.com/tallasaicharith/student-os", liveUrl: "" }
];

(globalThis as any).__STUDENT_OS_PROJECTS = (globalThis as any).__STUDENT_OS_PROJECTS || [...PRESENTATION_PROJECTS];

export async function GET() {
  try {
    const userId = await getOrCreateUser();
    const projects = await db.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (projects.length > 0) {
      (globalThis as any).__STUDENT_OS_PROJECTS = projects;
      return NextResponse.json(projects);
    }
  } catch (_e) {}

  return NextResponse.json((globalThis as any).__STUDENT_OS_PROJECTS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = projectSchema.parse(body);

    const currentProjects = (globalThis as any).__STUDENT_OS_PROJECTS || [];
    const newProject = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...data,
      progress: data.progress || 0,
      createdAt: new Date().toISOString(),
    };

    currentProjects.unshift(newProject);
    (globalThis as any).__STUDENT_OS_PROJECTS = currentProjects;

    // Async attempt DB sync
    Promise.resolve().then(async () => {
      try {
        const userId = await getOrCreateUser();
        await db.project.create({
          data: { ...data, userId },
        });
      } catch (_dbErr) {}
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (_e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
