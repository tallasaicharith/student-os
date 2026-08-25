import { db } from "@/lib/db";
import { sanitizePromptText } from "./security";

export interface StudentContextOptions {
  includeTasks?: boolean;
  includeProjects?: boolean;
  includeSchedule?: boolean;
  includeHabits?: boolean;
}

export class StudentContextService {
  /**
   * Retrieves MINIMUM NECESSARY context for the current request
   */
  static async getRelevantContext(userId: string, options: StudentContextOptions = {}): Promise<string> {
    const {
      includeTasks = true,
      includeProjects = true,
      includeSchedule = true,
      includeHabits = false,
    } = options;

    let contextBlocks: string[] = [];

    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          tasks: includeTasks
            ? {
                where: { done: false },
                take: 5,
                orderBy: { priority: "asc" },
              }
            : false,
          projects: includeProjects
            ? {
                where: { status: { in: ["IN_PROGRESS", "NOT_STARTED"] } },
                take: 3,
                orderBy: { updatedAt: "desc" },
              }
            : false,
          habits: includeHabits ? { take: 5 } : false,
        },
      });

      if (!user) return "";

      contextBlocks.push(`STUDENT PROFILE: ${sanitizePromptText(user.name || "Student")}`);

      if (includeTasks && user.tasks && user.tasks.length > 0) {
        const taskTitles = user.tasks.map((t) => `• [${t.priority}] ${sanitizePromptText(t.title)} (${t.category})`).join("\n");
        contextBlocks.push(`TOP PENDING TASKS:\n${taskTitles}`);
      }

      if (includeProjects && user.projects && user.projects.length > 0) {
        const projDetails = user.projects.map((p) => `• ${sanitizePromptText(p.name)} (${p.progress}% done) - Stack: ${p.stack}`).join("\n");
        contextBlocks.push(`ACTIVE PROJECTS:\n${projDetails}`);
      }
    } catch (_e) {
      // Graceful context retrieval failover
    }

    if (contextBlocks.length === 0) return "";

    return `
## STUDENTOS CONTEXT (Minimum Necessary Data):
${contextBlocks.join("\n\n")}
`;
  }
}
