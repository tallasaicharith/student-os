const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const openAIKey = process.env.OPENAI_API_KEY;

async function main() {
  if (!openAIKey) {
    console.error("OPENAI_API_KEY is not defined in environment");
    return;
  }

  console.log("Seeding OpenAI key into Supabase PostgreSQL...");

  const users = ["guest", "guest_user", "user_default"];
  for (const u of users) {
    await prisma.aIProviderConfig.upsert({
      where: { userId: u },
      update: {
        openaiKey: openAIKey,
        defaultProvider: "openai",
        defaultModel: "gpt-4o-mini",
      },
      create: {
        userId: u,
        openaiKey: openAIKey,
        defaultProvider: "openai",
        defaultModel: "gpt-4o-mini",
      },
    });
  }

  console.log(">>> SUCCESS! OpenAI Key seeded into Supabase AIProviderConfig table!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
