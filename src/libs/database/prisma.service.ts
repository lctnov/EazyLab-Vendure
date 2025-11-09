import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }],
  });
  bundle: any;
  bundleItem: any;
	orderLine: any;
	productVariant: any;

  async onModuleInit() {
    try {
      this.prisma.$on('query', (e) => {
        // console.log('SQL Builer:', e.query);
      });
      await this.prisma.$connect();
    } catch (err) {
      console.error('❌ Prisma error:', err.message);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // asign client để sử dụng service cho các nơi
  get client() {
    return this.prisma;
  }
}
