import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";

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

export async function getOrCreateUser(): Promise<string> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return "guest_user";
    }

    const existing = await db.user.findUnique({
      where: { id: userId },
    });

    if (existing) {
      return existing.id;
    }

    // Fetch Clerk user details for first-time account initialization
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || `${userId}@studentos.app`;
    const name = clerkUser ? `${clerkUser.firstName || "Student"} ${clerkUser.lastName || ""}`.trim() : "Student";
    const imageUrl = clerkUser?.imageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`;

    await db.user.create({
      data: {
        id: userId,
        email,
        name,
        imageUrl,
        settings: { create: {} },
        habits: {
          createMany: {
            data: [
              { name: "Morning Routine", emoji: "🌅", order: 0 },
              { name: "Hydrate (2L Water)", emoji: "💧", order: 1 },
              { name: "Study Session (2h)", emoji: "📚", order: 2 },
              { name: "Daily Coding / Practice", emoji: "💻", order: 3 },
              { name: "Physical Exercise", emoji: "🏋️", order: 4 },
              { name: "20 Pages Reading", emoji: "📖", order: 5 },
              { name: "7 Hours Sleep", emoji: "😴", order: 6 },
            ]
          }
        },
        subjects: {
          createMany: {
            data: [
              { code: "CS101", name: "Data Structures & Algorithms", term: 1, priority: "HIGH", status: "IN_PROGRESS", progress: 0 },
              { code: "AI201", name: "Introduction to Artificial Intelligence", term: 1, priority: "HIGH", status: "IN_PROGRESS", progress: 0 },
              { code: "MATH102", name: "Linear Algebra & Calculus", term: 1, priority: "MEDIUM", status: "NOT_STARTED", progress: 0 },
              { code: "ENG101", name: "Technical Communication", term: 1, priority: "LOW", status: "NOT_STARTED", progress: 0 },
            ]
          }
        },
        tasks: {
          createMany: {
            data: [
              { title: "Complete StudentOS profile setup", category: "PERSONAL", priority: "HIGH", done: true },
              { title: "Add your term courses to Study Tracker", category: "STUDY", priority: "HIGH", done: false },
              { title: "Set up daily habit goals in Habits Hub", category: "PERSONAL", priority: "MEDIUM", done: false },
              { title: "Schedule your weekly study sessions", category: "STUDY", priority: "MEDIUM", done: false },
            ]
          }
        }
      }
    });

    return userId;
  } catch (_err) {
    return "guest_user";
  }
}

// Backwards compatibility alias
export const getOrCreateDevUser = getOrCreateUser;
