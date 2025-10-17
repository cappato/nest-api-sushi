import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { ZonesModule } from '../zones/zones.module';
import { OrdersService } from './orders.service';
import { PublicOrdersController } from './public-orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { OrdersValidationService } from './orders-validation.service';

@Module({
  imports: [PrismaModule, UsersModule, ZonesModule],
  providers: [OrdersService, OrdersValidationService],
  controllers: [PublicOrdersController, AdminOrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
