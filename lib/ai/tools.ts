import { db } from "@/lib/db";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
  allowedModes: string[];
}

export class ToolRegistry {
  private static tools: ToolDefinition[] = [
    {
      name: "getStudentTasks",
      description: "Get current pending tasks for the student",
      allowedModes: ["general", "study_plan"],
    },
    {
      name: "getProjects",
      description: "Get active projects and milestone progress",
      allowedModes: ["general", "resume_review", "code_review"],
    },
    {
      name: "getStudySchedule",
      description: "Get today's time-boxed study schedule",
      allowedModes: ["general", "study_plan"],
    },
    {
      name: "executeCode",
      description: "Sandboxed code execution (mock service)",
      allowedModes: ["code_review"],
    },
    {
      name: "generateQuiz",
      description: "Generate structured multiple choice quiz questions",
      allowedModes: ["quiz_gen"],
    },
  ];

  static getToolsForMode(mode: string): ToolDefinition[] {
    return this.tools.filter((t) => t.allowedModes.includes(mode) || t.allowedModes.includes("general"));
  }

  static async executeTool(toolName: string, userId: string, _args: Record<string, unknown> = {}): Promise<unknown> {
    switch (toolName) {
      case "getStudentTasks":
        return db.task.findMany({ where: { userId, done: false }, take: 10 });
      case "getProjects":
        return db.project.findMany({ where: { userId }, take: 5 });
      case "executeCode":
        return { status: "simulated", output: "Code syntax check passed. 0 runtime exceptions." };
      default:
        return { status: "unknown_tool" };
    }
  }
}
