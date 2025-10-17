import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppLogger } from '../common/logger/logger.service';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {


  constructor(private readonly logger: AppLogger) {
    super({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'minimal',
      transactionOptions: {
        maxWait: 10_000,
        timeout: 10_000,
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }
}

