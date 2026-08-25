const { db, getOrCreateUser } = require('../lib/db');

async function debugHabitDb() {
  console.log("=== DEBUGGING HABIT DB CREATION ===");
  try {
    const userId = await getOrCreateUser();
    console.log("Got UserId:", userId);

    const count = await db.habit.count({ where: { userId } });
    console.log("Current Count:", count);

    const habit = await db.habit.create({
      data: {
        userId,
        name: "Test Habit",
        emoji: "⚡",
        order: count,
      },
      include: { logs: true },
    });

    console.log("Habit Created Successfully:", habit);
  } catch (err) {
    console.error("Prisma Error Message:", err.message);
    console.error("Full Stack:", err.stack);
  }
}

debugHabitDb();
