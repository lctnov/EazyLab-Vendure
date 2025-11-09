import { Module } from '@nestjs/common';
import { CmBundleService } from './services/cm_bundle.service';
import { CmBundleRepository } from './repositories/cm_bundle.repository';
import { PrismaModule } from '@/libs/database/prisma.module';

@Module({
  imports: [PrismaModule], // ✅ thêm dòng này
  providers: [CmBundleService, CmBundleRepository],
  exports: [CmBundleService],
})
export class CmBundleModule {}
