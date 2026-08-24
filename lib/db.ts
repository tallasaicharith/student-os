import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export async function getOrCreateDevUser(): Promise<string> {
  const userId = "dev_user";
  try {
    const existing = await db.user.findUnique({
      where: { id: userId },
    });
    if (!existing) {
      await db.user.create({
        data: {
          id: userId,
          email: "dev@studentos.local",
          name: "Sai Charthik",
          imageUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sai",
          settings: { create: {} },
          habits: {
            createMany: {
              data: [
                { name: "Wake up at 4:00 AM", emoji: "🌅", order: 0 },
                { name: "Gym Workout", emoji: "🏋️", order: 1 },
                { name: "Drink 3L Water", emoji: "💧", order: 2 },
                { name: "Gita Reading", emoji: "📖", order: 3 },
                { name: "LeetCode Daily", emoji: "💻", order: 4 },
                { name: "Protein Target", emoji: "🥩", order: 5 },
                { name: "20 Pages Reading", emoji: "📚", order: 6 },
                { name: "7 Hours Sleep", emoji: "😴", order: 7 }
              ]
            }
          },
          subjects: {
            createMany: {
              data: [
                // Term 1
                { code: "MA112", name: "Probability Theory & Statistical Analysis", term: 1, priority: "HIGH", status: "IN_PROGRESS", progress: 10 },
                { code: "AI201", name: "Fundamentals of Artificial Intelligence", term: 1, priority: "HIGH", status: "IN_PROGRESS", progress: 15 },
                { code: "CS207", name: "Data Structures Using C++", term: 1, priority: "HIGH", status: "IN_PROGRESS", progress: 20 },
                { code: "DS204", name: "Advanced Database Management Systems", term: 1, priority: "MEDIUM", status: "NOT_STARTED", progress: 0 },
                { code: "RE101", name: "Research Methodology", term: 1, priority: "LOW", status: "NOT_STARTED", progress: 0 },
                { code: "EC102", name: "MS Office Specialist: Word 2019", term: 1, priority: "CERT", status: "NOT_STARTED", progress: 0 },
                { code: "EC201", name: "English Language Proficiency B2", term: 1, priority: "CERT", status: "NOT_STARTED", progress: 0 },
                // Term 2
                { code: "MA113", name: "Linear Algebra Essentials", term: 2, priority: "HIGH", status: "NOT_STARTED", progress: 0 },
                { code: "CS209", name: "Advanced Data Structures", term: 2, priority: "HIGH", status: "NOT_STARTED", progress: 0 },
                { code: "CS210", name: "Backend Development Fundamentals", term: 2, priority: "HIGH", status: "NOT_STARTED", progress: 0 },
                { code: "DS201", name: "Foundations of Data Science", term: 2, priority: "HIGH", status: "NOT_STARTED", progress: 0 },
                { code: "RE102", name: "Research and Publication Ethics", term: 2, priority: "LOW", status: "NOT_STARTED", progress: 0 },
                { code: "EC103", name: "MS Office Specialist: Excel 2019", term: 2, priority: "CERT", status: "NOT_STARTED", progress: 0 },
                // Term 3
                { code: "EL101", name: "Digital Electronics", term: 3, priority: "MEDIUM", status: "NOT_STARTED", progress: 0 },
                { code: "AI203", name: "Introduction to Machine Learning", term: 3, priority: "HIGH", status: "NOT_STARTED", progress: 0 },
                { code: "CS211", name: "Analysis of Algorithms", term: 3, priority: "HIGH", status: "NOT_STARTED", progress: 0 },
                { code: "CS212", name: "Software Engineering Fundamentals", term: 3, priority: "MEDIUM", status: "NOT_STARTED", progress: 0 },
                { code: "EC104", name: "MS Office: PowerPoint 2019", term: 3, priority: "CERT", status: "NOT_STARTED", progress: 0 },
                // Term 4
                { code: "AI202", name: "Internship II", term: 4, priority: "HIGH", status: "NOT_STARTED", progress: 0 },
                { code: "MS101", name: "Managerial Economics & Financial Accounting", term: 4, priority: "LOW", status: "NOT_STARTED", progress: 0 },
                { code: "RE203", name: "Workshop", term: 4, priority: "CERT", status: "NOT_STARTED", progress: 0 }
              ]
            }
          },
          tasks: {
            createMany: {
              data: [
                { title: "Wake up at 4:00 AM", category: "PERSONAL", priority: "HIGH", done: false },
                { title: "Perform Gym workout (Chest + Triceps)", category: "FITNESS", priority: "HIGH", done: false },
                { title: "Drink 500ml water immediately after waking up", category: "PERSONAL", priority: "MEDIUM", done: false },
                { title: "Read Bhagavad Gita Chapter 2, Verse 47 during bus travel", category: "STUDY", priority: "MEDIUM", done: false },
                { title: "Attend B-Tech Lectures: Data Structures, Artificial Intelligence", category: "STUDY", priority: "HIGH", done: false },
                { title: "Power nap for 20 mins after college return", category: "PERSONAL", priority: "MEDIUM", done: false },
                { title: "Solve 5 LeetCode Dynamic Programming challenges", category: "PROJECT", priority: "HIGH", done: false },
                { title: "Read 20 pages of Grokking Algorithms book", category: "STUDY", priority: "MEDIUM", done: false },
                { title: "Draft ATS-optimized Resume for Step Internships", category: "PROJECT", priority: "MEDIUM", done: false },
                { title: "Log protein intake goal (140g target)", category: "FITNESS", priority: "HIGH", done: false }
              ]
            }
          }
        }
      });
    }
  } catch (_err) {
    // Database connection unavailable or offline - return dev user ID without crashing
  }
  return userId;
}
