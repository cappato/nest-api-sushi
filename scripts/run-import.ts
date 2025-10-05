import 'reflect-metadata';
import { readFileSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { ImportCliModule } from '../src/import/import-cli.module';
import { FudoImportService } from '../src/import/services/fudo-import.service';

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Uso: tsx scripts/run-import.ts <ruta-al-excel>');
    process.exit(1);
  }

  console.log(`Reading file: ${filePath}`);
  const buf = readFileSync(filePath);

  console.log('Creating NestJS application context...');
  const app = await NestFactory.createApplicationContext(ImportCliModule, {
    logger: ['error', 'warn', 'log'],
  });

  const svc = app.get(FudoImportService);

  try {
    console.log('Starting import...');
    await svc.importFromBuffer(buf);
    console.log('Import completed successfully!');
  } finally {
    await app.close();
  }
}

main().catch((e) => {
  console.error('Import failed:', e);
  process.exit(1);
});

