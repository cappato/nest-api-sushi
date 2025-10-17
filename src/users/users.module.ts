import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // Exportar para usar en OrdersModule
})
export class UsersModule {}
