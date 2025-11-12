import { Module } from '@nestjs/common';
import { InventoryController } from './controllers/cm_inventory.controller';
import { InventoryService } from './services/cm_inventory.service';
import { AuthModule } from '@/apps/auth/auth.module';

@Module({
	imports: [AuthModule],
	controllers: [InventoryController],
	providers: [InventoryService],
	exports: [InventoryService],
})
export class CmInventoryModule {}