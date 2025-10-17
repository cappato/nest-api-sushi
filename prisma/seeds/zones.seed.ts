import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed de zonas de envío para Mar del Plata
 * Coordenadas aproximadas de zonas reales
 */
export async function seedZones() {
  console.log('🗺️  Seeding zones...');

  // Zona Centro - Área céntrica de Mar del Plata
  const centro = await prisma.zone.upsert({
    where: { slug: 'centro' },
    update: {},
    create: {
      name: 'Centro',
      slug: 'centro',
      deliveryFee: 500,
      active: true,
      priority: 10,
      version: 1,
      // Polígono aproximado del centro de Mar del Plata
      polygon: [
        [-38.0000, -57.5500], // Noroeste
        [-38.0000, -57.5400], // Noreste
        [-38.0100, -57.5400], // Sureste
        [-38.0100, -57.5500], // Suroeste
        [-38.0000, -57.5500], // Cierre del polígono
      ],
    },
  });

  // Zona Constitución - Barrio Constitución
  const constitucion = await prisma.zone.upsert({
    where: { slug: 'constitucion' },
    update: {},
    create: {
      name: 'Constitución',
      slug: 'constitucion',
      deliveryFee: 800,
      active: true,
      priority: 8,
      version: 1,
      // Polígono aproximado de Constitución
      polygon: [
        [-38.0050, -57.5600], // Noroeste
        [-38.0050, -57.5500], // Noreste
        [-38.0150, -57.5500], // Sureste
        [-38.0150, -57.5600], // Suroeste
        [-38.0050, -57.5600], // Cierre
      ],
    },
  });

  // Zona Faro - Zona del Faro
  const faro = await prisma.zone.upsert({
    where: { slug: 'faro' },
    update: {},
    create: {
      name: 'Faro',
      slug: 'faro',
      deliveryFee: 1000,
      active: true,
      priority: 5,
      version: 1,
      // Polígono aproximado zona Faro
      polygon: [
        [-37.9900, -57.5400], // Noroeste
        [-37.9900, -57.5300], // Noreste
        [-38.0000, -57.5300], // Sureste
        [-38.0000, -57.5400], // Suroeste
        [-37.9900, -57.5400], // Cierre
      ],
    },
  });

  // Zona de prueba - Cubre toda Mar del Plata
  const mdqAll = await prisma.zone.upsert({
    where: { slug: 'mdq-all' },
    update: {},
    create: {
      name: 'Mar del Plata (test)',
      slug: 'mdq-all',
      deliveryFee: 0,
      active: true,
      priority: 1,
      version: 1,
      // Polígono que cubre toda la ciudad para testing
      polygon: [
        [-37.95, -57.50], // Noroeste
        [-37.95, -57.70], // Noreste
        [-38.10, -57.70], // Sureste
        [-38.10, -57.50], // Suroeste
        [-37.95, -57.50], // Cierre
      ],
    },
  });

  console.log(`✅ Created zones: ${centro.name}, ${constitucion.name}, ${faro.name}, ${mdqAll.name}`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedZones()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

