import { Module } from '@nestjs/common';
import { ReportService } from './services/rp_top-bundle.service';
import { ReportController } from './controllers/rp_top-bundle.controller';

@Module({
  controllers: [ReportController],
  providers: [ReportService],
})
export class RpTopBundleModule {}