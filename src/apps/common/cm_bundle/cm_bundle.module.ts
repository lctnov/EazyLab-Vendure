import { Module } from '@nestjs/common';
import { CmBundleController } from './controllers/cm_bundle.controller';
import { CmBundleService } from './services/cm_bundle.service';
import { CmBundleRepository } from './repositories/cm_bundle.repository';
import { AuthModule } from '@/apps/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CmBundleController],
  providers: [CmBundleService, CmBundleRepository],
  exports: [CmBundleService],
})
export class CmBundleModule {}
