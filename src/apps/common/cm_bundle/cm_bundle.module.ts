import { Module } from '@nestjs/common';
import { CmBundleController } from './controllers/cm_bundle.controller';
import { CmBundleService } from './services/cm_bundle.service';
import { CmBundleRepository } from './repositories/cm_bundle.repository';
import { PrismaModule } from '@/libs/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CmBundleController],
  providers: [CmBundleService, CmBundleRepository],
  exports: [CmBundleService],
})
export class CmBundleModule {}
