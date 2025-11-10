import { AuthModule } from '@/apps/auth/auth.module';
import { SysUsersModule } from '@/apps/system/sys_users/sys_users.module';
import { CmBundleModule } from '@/apps/common/cm_bundle/cm_bundle.module';
// import { InventoryModule } from '@/apps/common/inventory/inventory.module';
// import { OrderModule } from '@/apps/common/order/order.module';
// import { CartModule } from '@/apps/common/cart/cart.module';

export const appProviders = [
	AuthModule,
	// SysUsersModule,
	CmBundleModule,
//   InventoryModule,
//   OrderModule,
//   CartModule,
];
