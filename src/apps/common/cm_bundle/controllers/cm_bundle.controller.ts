import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CmBundleService } from '../services/cm_bundle.service';
import { CreateBundleDto } from '../dto/create-cm_bundle.dto';
import { UpdateBundleDto } from '../dto/update-cm_bundle.dto';
import { AddItemDto } from '../dto/add-item.dto';

@Controller('bundle')
export class CmBundleController {
  constructor(private service: CmBundleService) {}

  @Get()
  async getAll() {
    return this.service.getBundles();
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getBundle(BigInt(id));
  }

  @Post()
  async create(@Body() dto: CreateBundleDto) {
    return this.service.createBundle(dto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBundleDto) {
    return this.service.updateBundle(BigInt(id), dto);
  }

  @Post(':id/items')
  async addItem(@Param('id', ParseIntPipe) id: number, @Body() dto: AddItemDto) {
    return this.service.addItem(BigInt(id), dto);
  }

  @Delete('item/:itemId')
  async removeItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.service.removeItem(BigInt(itemId));
  }

  @Get(':id/price')
  async calculatePrice(@Param('id', ParseIntPipe) id: number) {
    const price = await this.service.calculateBundlePrice(BigInt(id));
    return { bundleId: id, price };
  }
}
