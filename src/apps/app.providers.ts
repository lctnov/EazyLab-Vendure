import { AuthModule } from '@/apps/auth/auth.module';
import { CmBundleModule } from '@/apps/common/cm_bundle/cm_bundle.module';
import { CartModule } from '@/apps/common/cm_cart/cm_cart.module';
import { CmOrderModule } from '@/apps/common/cm_order/cm_order.module';
import { RpTopBundleModule } from '@/apps/reports/rp_topBundleProduct/rp_top-bundle.module';

export const appProviders = [
	AuthModule,
	CmBundleModule,
	CartModule,
	CmOrderModule,
	RpTopBundleModule,
];
