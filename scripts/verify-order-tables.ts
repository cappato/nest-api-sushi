import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_DATABASE_URL,
      },
    },
  });

  try {
    console.log('Verificando tablas del sistema de pedidos...\n');

    // Verificar que los modelos existen en el cliente Prisma
    console.log('✅ Modelos disponibles en Prisma Client:');
    console.log('  - User:', typeof prisma.user !== 'undefined' ? '✓' : '✗');
    console.log('  - Order:', typeof prisma.order !== 'undefined' ? '✓' : '✗');
    console.log('  - OrderItem:', typeof prisma.orderItem !== 'undefined' ? '✓' : '✗');

    // Intentar contar registros (debería ser 0 en tablas nuevas)
    console.log('\n📊 Conteo de registros:');
    const userCount = await prisma.user.count();
    const orderCount = await prisma.order.count();
    const orderItemCount = await prisma.orderItem.count();

    console.log(`  - Users: ${userCount}`);
    console.log(`  - Orders: ${orderCount}`);
    console.log(`  - OrderItems: ${orderItemCount}`);

    console.log('\n✅ Todas las tablas del sistema de pedidos están creadas correctamente!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

