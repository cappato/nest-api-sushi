import { Module } from '@nestjs/common';
import { FudoImportService } from './services/fudo-import.service';

@Module({
  providers: [FudoImportService],
  exports: [FudoImportService],
})
export class ImportModule {}

