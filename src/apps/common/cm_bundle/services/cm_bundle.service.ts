import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CmBundleRepository } from '../repositories/cm_bundle.repository';
import { CreateBundleDto } from '../dto/create-cm_bundle.dto';
import { UpdateBundleDto } from '../dto/update-cm_bundle.dto';
import { AddItemDto } from '../dto/add-item.dto';
import { PrismaService } from '@libs/database/prisma.service';

@Injectable()
export class CmBundleService {
  constructor(
    private repo: CmBundleRepository,
    private prisma: PrismaService, // vẫn giữ để tính giá variant
  ) {}

  async createBundle(dto: CreateBundleDto) {
    const exists = await this.repo.findByCode(dto.code);
    if (exists) throw new BadRequestException('Bundle code already exists');

    const bundle = await this.repo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      priceStrategy: dto.priceStrategy,
      discountValue: dto.discountValue,
      // fixedPrice: dto.fixedPrice,
      items: dto.items
        ? {
            create: dto.items.map((i) => ({
              productVariantId: i.productVariantId,
              quantity: i.quantity,
            })),
          }
        : undefined,
    });

    return bundle;
  }

  async updateBundle(id: bigint, dto: UpdateBundleDto) {
    const bundle = await this.repo.findById(id);
    if (!bundle) throw new NotFoundException('Bundle not found');

    return this.repo.update(id, dto);
  }

  async addItem(bundleId: bigint, dto: AddItemDto) {
    const bundle = await this.repo.findById(bundleId);
    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }
  
    // ⚠️ Nếu productVariantId từ request là string, cần ép kiểu
    const variantId = BigInt(dto.productVariantId);
  
    // Kiểm tra trùng variant trong cùng bundle
    if (bundle.items.some((i) => i.productVariantId === variantId)) {
      throw new BadRequestException('Duplicate variant not allowed');
    }
  
    // Tạo item mới
    return this.repo.addItem({
      bundleId,
      productVariantId: variantId,
      quantity: dto.quantity,
    });
  }
  
  

  async removeItem(itemId: bigint) {
    const exists = await this.repo.findItemById(itemId);
    if (!exists) throw new NotFoundException('Item not found');

    await this.repo.removeItem(itemId);
    return true;
  }

  async getBundles() {
    return this.repo.findAll();
  }

  async getBundle(id: bigint) {
    const bundle = await this.repo.findById(id);
    if (!bundle) throw new NotFoundException('Bundle not found');
    return bundle;
  }

  async calculateBundlePrice(bundleId: bigint): Promise<number> {
    const bundle = await this.repo.findById(bundleId);
    if (!bundle) throw new NotFoundException('Bundle not found');

    const getVariantPrice = async (variantId: bigint): Promise<number> => {
      const pv = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!pv) throw new NotFoundException(`Variant ${variantId} not found`);
      return pv.price;
    };

    let sum = 0;
    for (const item of bundle.items ?? []) {
      const price = await getVariantPrice(item.productVariantId);
      sum += price * item.quantity;
    }

    if (bundle.priceStrategy === 'sum') return sum;
    if (bundle.priceStrategy === 'fixed') return bundle.fixedPrice ?? 0;
    if (bundle.priceStrategy === 'percent') {
      return sum * (1 - (bundle.discountValue ?? 0) / 100);
    }

    throw new BadRequestException('Unknown price strategy');
  }
}
