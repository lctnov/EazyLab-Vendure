import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ReportService } from '../services/rp_top-bundle.service';
import { TopBundlesQueryDto } from '../dto/rp_top-bundle.dto';
import { Public } from '@/libs/decorators/public.decorator'

@Public()
@ApiTags('Quản lý báo cáo')
@Controller('v1')
export class ReportController {
	constructor(private readonly reportService: ReportService) {}
  
	@Get('top-bundles')
	@ApiOperation({ summary: 'Top các gói sản phẩm bán chạy theo doanh thu' })
	@ApiQuery({ name: 'from', type: String, example: '2025-11-01' })
	@ApiQuery({ name: 'to', type: String, example: '2025-11-12' })
	@ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
	@ApiResponse({ status: 200, description: 'Danh sách các gói sản phẩm bán chạy' })
	@UsePipes(new ValidationPipe({ transform: true }))
	async topBundles(@Query() query: TopBundlesQueryDto) {
	  const { from, to, limit } = query;
	  return this.reportService.topBundles(from, to, limit);
	}
}