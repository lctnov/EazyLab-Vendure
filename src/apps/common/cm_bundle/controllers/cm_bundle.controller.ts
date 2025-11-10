import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Patch } from '@nestjs/common';
import { CmBundleService } from '../services/cm_bundle.service';
import { CreateBundleDto } from '../dto/create-cm_bundle.dto';
import { UpdateBundleDto } from '../dto/update-cm_bundle.dto';
import { AddItemDto } from '../dto/add-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Bundle Management') // ✅ Nhóm hiển thị trong Swagger UI
@Controller('bundle')
export class CmBundleController {
  constructor(private service: CmBundleService) {}

  // ======================
  // GET ALL BUNDLES
  // ======================
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bundle' })
  @ApiResponse({ status: 200, description: 'Danh sách bundle trả về thành công' })
  async getAll() {
    return this.service.getBundles();
  }

  // ======================
  // GET ONE BUNDLE
  // ======================
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bundle theo ID' })
  @ApiParam({ name: 'id', description: 'ID của bundle', type: Number })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết của bundle' })
  @ApiResponse({ status: 404, description: 'Bundle không tồn tại' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getBundle(BigInt(id));
  }

  // ======================
  // CREATE BUNDLE
  // ======================
  @Post()
  @ApiOperation({ summary: 'Tạo mới một bundle' })
  @ApiBody({ type: CreateBundleDto })
  @ApiResponse({ status: 201, description: 'Tạo bundle thành công' })
  async create(@Body() dto: CreateBundleDto) {
    return this.service.createBundle(dto);
  }

  // ======================
  // UPDATE BUNDLE
  // ======================
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin bundle (partial)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBundleDto) {
    return this.service.updateBundle(BigInt(id), dto);
  }

  // ======================
  // ADD ITEM TO BUNDLE
  // ======================
  @Post(':id/items')
  @ApiOperation({ summary: 'Thêm sản phẩm vào bundle' })
  @ApiParam({ name: 'id', description: 'ID của bundle', type: Number })
  @ApiBody({ type: AddItemDto })
  @ApiResponse({ status: 201, description: 'Thêm item thành công' })
  @ApiResponse({ status: 400, description: 'Trùng productVariantId hoặc dữ liệu không hợp lệ' })
  async addItem(@Param('id', ParseIntPipe) id: number, @Body() dto: AddItemDto) {
    return this.service.addItem(BigInt(id), dto);
  }

  // ======================
  // REMOVE ITEM FROM BUNDLE
  // ======================
  @Delete('item/:itemId')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi bundle' })
  @ApiParam({ name: 'itemId', description: 'ID của item trong bundle', type: Number })
  @ApiResponse({ status: 200, description: 'Xóa item thành công' })
  async removeItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.service.removeItem(BigInt(itemId));
  }

  // ======================
  // CALCULATE BUNDLE PRICE
  // ======================
  @Get(':id/price')
  @ApiOperation({ summary: 'Tính giá của bundle dựa trên chiến lược giá' })
  @ApiParam({ name: 'id', description: 'ID của bundle', type: Number })
  @ApiResponse({ status: 200, description: 'Giá bundle được tính thành công' })
  async calculatePrice(@Param('id', ParseIntPipe) id: number) {
    const price = await this.service.calculateBundlePrice(BigInt(id));
    return { bundleId: id, price };
  }
}
