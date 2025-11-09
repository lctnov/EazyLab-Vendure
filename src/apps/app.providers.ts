import { AuthModule } from "./auth/auth.module";
import { SysUsersModule } from '@/apps/system/sys_users/sys_users.module';
import { CmBundleModule } from '@/apps/common/cm_bundle/cm_bundle.module';
export const appProviders = [
	 AuthModule,
	 SysUsersModule,
	 CmBundleModule
];
