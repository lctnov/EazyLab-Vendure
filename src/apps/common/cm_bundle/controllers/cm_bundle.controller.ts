import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Patch, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { CmBundleService } from '../services/cm_bundle.service';
import { CreateBundleDto } from '../dto/create-cm_bundle.dto';
import { UpdateBundleDto } from '../dto/update-cm_bundle.dto';
import { AddItemDto } from '../dto/add-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CookieJwtGuard } from '../../guards/cookie-jwt.guard';

@UseGuards(CookieJwtGuard)
@ApiTags('Quản lý các gói sản phẩm')
@Controller('v1')
export class CmBundleController {
  constructor(private service: CmBundleService) {}

  @Get('getAll')
  @ApiOperation({ summary: 'Lấy danh sách tất cả các gói sản phẩm' })
  @ApiResponse({ status: 200, description: 'Danh sách bundle trả về thành công' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAll() {
    return this.service.getBundles();
  }

  @Get('get/:bundleId')
  @ApiOperation({ summary: 'Lấy chi tiết các gói có cùng mã sản phẩm' })
  @ApiParam({ name: 'id', description: 'ID của bundle', type: Number })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết của bundle' })
  @ApiResponse({ status: 404, description: 'Bundle không tồn tại' })
  async getOne(@Param('bundleId', ParseIntPipe) bundleId: number) {
    return this.service.getBundle(BigInt(bundleId));
  }

  @Post('create')
  @ApiOperation({ summary: 'Tạo mới một gói sản phẩm' })
  @ApiBody({ type: CreateBundleDto })
  @ApiResponse({ status: 201, description: 'Tạo bundle thành công' })
  async create(@Body() dto: CreateBundleDto) {
    return this.service.createBundle(dto);
  }

  @Patch('update/:bundleId')
  @ApiOperation({ summary: 'Cập nhật thông tin các gói sản phẩm' })
  async update(@Param('bundleId', ParseIntPipe) bundleId: number, @Body() dto: UpdateBundleDto) {
    return this.service.updateBundle(BigInt(bundleId), dto);
  }

  @Post('bundleItems/create/:bundleId')
  @ApiOperation({ summary: 'Thêm chi tiết các gói sản phẩm' })
  @ApiParam({ name: 'id', description: 'ID của bundle', type: Number })
  @ApiBody({ type: AddItemDto })
  @ApiResponse({ status: 201, description: 'Thêm item thành công' })
  @ApiResponse({ status: 400, description: 'Trùng variantId hoặc dữ liệu không hợp lệ' })
  async addItem(@Param('bundleId', ParseIntPipe) bundleId: number, @Body() dto: AddItemDto) {
    return this.service.addItem(BigInt(bundleId), dto);
  }

  @Delete('bundleItem/:bundleItemId')
  @ApiOperation({ summary: 'Xóa chi tiết các gói sản phẩm' })
  @ApiParam({ name: 'bundleItemId', description: 'ID của item trong bundle', type: Number })
  @ApiResponse({ status: 200, description: 'Xóa item thành công' })
  async removeItem(@Param('bundleItemId', ParseIntPipe) bundleItemId: number) {
    return this.service.removeItem(BigInt(bundleItemId));
  }

  @Get('calculatorPrice/:bundleId')
  @ApiOperation({ summary: 'Tính giá các gói sản phẩm dựa trên thông tin giá' })
  @ApiParam({ name: 'bundleId', description: 'ID của bundle', type: Number })
  @ApiResponse({ status: 200, description: 'Giá bundle được tính thành công' })
  async calculatePrice(@Param('bundleId', ParseIntPipe) bundleId: number) {
    const price = await this.service.calculateBundlePrice(BigInt(bundleId));
    return { bundleId: bundleId, price };
  }
}
