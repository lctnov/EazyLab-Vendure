import { Module } from '@nestjs/common';
import { OrderController } from './controllers/cm_order.controller';
import { OrderService } from './services/cm_order.service';
import { CmInventoryModule } from '../cm_inventory/cm_inventory.module';
import { AuthModule } from '@/apps/auth/auth.module';

@Module({
  imports: [AuthModule, CmInventoryModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class CmOrderModule {}