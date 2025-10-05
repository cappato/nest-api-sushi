import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Testing database connection...');

    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    console.log('✅ Connection successful!');
    console.log(`📊 Tables in public schema: ${result[0].count}`);

    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('\n📋 Tables:');
    tables.forEach((t) => console.log(`  - ${t.table_name}`));

    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const providerCount = await prisma.provider.count();

    console.log('\n📈 Current data:');
    console.log(`  - Products: ${productCount}`);
    console.log(`  - Categories: ${categoryCount}`);
    console.log(`  - Providers: ${providerCount}`);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

