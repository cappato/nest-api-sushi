import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { HealthController } from './health/health.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { PrismaModule } from './prisma/prisma.module';
import { ImportModule } from './import/import.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { BusinessModule } from './business/business.module';
import { ZonesModule } from './zones/zones.module';
import databaseConfig from './config/database.config';
import businessConfig from './config/business.config';

import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development',
      load: [databaseConfig, businessConfig],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('business.throttle.ttl', 60000),
          limit: configService.get<number>('business.throttle.limit', 10),
        },
      ],
      inject: [ConfigService],
    }),
    LoggerModule,
    PrismaModule,
    DatabaseModule,
    ImportModule,
    MenuModule,
    OrdersModule,
    UsersModule,
    BusinessModule,
    ZonesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    ...(process.env.SKIP_THROTTLE !== 'true'
      ? [
          {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
          },
        ]
      : []),
  ],
})
export class AppModule {}
