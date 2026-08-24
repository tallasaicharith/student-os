const { PrismaClient } = require('@prisma/client');
const regions = ['ap-south-1', 'us-east-1', 'eu-central-1', 'ap-southeast-1', 'us-west-1', 'ca-central-1', 'sa-east-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-2'];

async function test() {
  for (const r of regions) {
    for (const port of [5432, 6543]) {
      const url = `postgresql://postgres.sqvtmdbtwnitoprnwvjo:%24x3KGyRvL%25k%24%3F.b@aws-0-${r}.pooler.supabase.com:${port}/postgres?pgbouncer=true&connection_limit=1`;
      console.log(`Testing region ${r} on port ${port}...`);
      const client = new PrismaClient({ datasources: { db: { url } } });
      try {
        await client.$connect();
        console.log(`>>> SUCCESS region: ${r}, port: ${port}`);
        console.log(`URL: ${url}`);
        await client.$disconnect();
        return;
      } catch(e) {
        console.log(`Failed ${r}:${port} -> ${e.message.split('\n')[0]}`);
        await client.$disconnect();
      }
    }
  }
}
test();
