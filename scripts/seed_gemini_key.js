require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const geminiKey = process.env.GEMINI_API_KEY;

async function main() {
  if (!geminiKey) {
    console.error("GEMINI_API_KEY is not defined in .env");
    return;
  }
  console.log("Seeding Google AI Studio key into Supabase PostgreSQL...");

  const users = ["guest", "guest_user", "user_default"];
  for (const u of users) {
    await prisma.aIProviderConfig.upsert({
      where: { userId: u },
      update: {
        geminiKey: geminiKey,
        defaultProvider: "gemini",
        defaultModel: "gemini-2.5-flash",
      },
      create: {
        userId: u,
        geminiKey: geminiKey,
        defaultProvider: "gemini",
        defaultModel: "gemini-2.5-flash",
      },
    });
  }

  console.log(">>> SUCCESS! Google AI Studio Key seeded into Supabase AIProviderConfig table!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
