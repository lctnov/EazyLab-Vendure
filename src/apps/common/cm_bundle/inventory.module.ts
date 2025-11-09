import { Module } from '@nestjs/common';
import { PrismaService } from '@libs/database/prisma.service';
import { InventoryService } from './services/inventory.service';
import { CartService } from './services/cart.service';
import { OrderService } from './services/order.service';

@Module({
  providers: [PrismaService, InventoryService, CartService, OrderService],
  exports: [InventoryService],
})
export class InventoryModule {}
