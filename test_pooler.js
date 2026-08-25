const { PrismaClient } = require('@prisma/client');

async function main() {
  const url = "postgresql://postgres.vdovfaffmfhydwewpguo:Mu03xdzeKv2soGc4@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
  console.log("Testing Supabase Pooler...");
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const userCount = await prisma.user.count();
    console.log(">>> SUCCESS! Supabase PostgreSQL connected! Total Users:", userCount);
  } catch (err) {
    console.error("Pooler Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
