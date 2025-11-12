import { Module } from '@nestjs/common';
import { CartService } from './services/cm_cart.service';
import { CartController } from './controllers/cm_cart.controller';
import { CmBundleModule } from '../cm_bundle/cm_bundle.module';
import { AuthModule } from '@/apps/auth/auth.module';
import { CmInventoryModule } from '../cm_inventory/cm_inventory.module'

@Module({
  imports: [CmBundleModule, CmInventoryModule, AuthModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}