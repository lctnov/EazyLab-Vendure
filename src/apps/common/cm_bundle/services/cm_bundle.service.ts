import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CmBundleRepository } from '../repositories/cm_bundle.repository';
import { CreateBundleDto } from '../dto/create-cm_bundle.dto';
import { UpdateBundleDto } from '../dto/update-cm_bundle.dto';
import { AddItemDto } from '../dto/add-item.dto';
import { PriceStrategy, Prisma } from '@prisma/client';
import { BundleEntity } from '../entities/cm_bundle.entity';
import { now } from '@/libs/utils/date.util';

@Injectable()
export class CmBundleService {
  constructor(
    private readonly repo: CmBundleRepository,
  ) {}

  async getBundles(): Promise<(BundleEntity & { finalPrice: number })[]> {
    const bundles = await this.repo.findAll();
    return bundles.map((item) => this.withFinalPrice(item));
  }

  async getBundle(bundleId: bigint): Promise<BundleEntity & { finalPrice: number }> {
    const bundle = await this.repo.findById(bundleId);
    if (!bundle) throw new NotFoundException('Không tìm thấy sản phẩm !!!');
    return this.withFinalPrice(bundle);
  }

  async createBundle(dto: CreateBundleDto): Promise<BundleEntity & { finalPrice: number }> {
    // 1. Kiểm tra code trùng
    const exists = await this.repo.findByCode(dto.code);
    if (exists) throw new BadRequestException('Mã bundle đã tồn tại');
  
    // 2. Validate items
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Bundle phải có ít nhất 1 sản phẩm');
    }
  
    const variantIds = dto.items.map(i => i.variantId);
    const uniqueVariantIds = new Set(variantIds);
    if (uniqueVariantIds.size !== variantIds.length) {
      throw new BadRequestException('Không được thêm variant trùng trong bundle');
    }
  
    // 3. Validate quantity >= 1
    for (const item of dto.items) {
      if (!item.quantity || item.quantity < 1) {
        throw new BadRequestException('Số lượng phải >= 1');
      }
    }
  
    // 4. Validate theo priceStrategy
    switch (dto.priceStrategy) {
      case 'SUM':
        if (dto.fixedPrice != null || dto.discountValue != null) {
          throw new BadRequestException('SUM không được có fixedPrice hoặc discountValue');
        }
        break;
      case 'FIXED':
        if (dto.fixedPrice == null) {
          throw new BadRequestException('FIXED phải có fixedPrice');
        }
        if (dto.discountValue != null) {
          throw new BadRequestException('FIXED không được có discountValue');
        }
        break;
      case 'PERCENT':
        if (dto.discountValue == null || dto.discountValue <= 0 || dto.discountValue >= 100) {
          throw new BadRequestException('PERCENT phải có discountValue từ 1 đến 99');
        }
        if (dto.fixedPrice != null) {
          throw new BadRequestException('PERCENT không được có fixedPrice');
        }
        break;
      default:
        throw new BadRequestException('priceStrategy không hợp lệ');
    }
  
    // 5. Tạo bundle
    const bundle = await this.repo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
      priceStrategy: dto.priceStrategy,
      fixedPrice: dto.fixedPrice != null ? new Prisma.Decimal(dto.fixedPrice) : null,
      discountValue: dto.discountValue != null ? new Prisma.Decimal(dto.discountValue) : undefined,
      createdby: 'admin',
      createdtime: now(),
      items: {
        create: dto.items.map((i) => ({
          variantId: BigInt(i.variantId),
          quantity: i.quantity,
          createdby: 'admin',
          createdtime: now(),
        })),
      },
    });
  
    // 6. Tính finalPrice
    return this.withFinalPrice(bundle);
  }

  async updateBundle(
    bundleId: bigint,
    dto: UpdateBundleDto,
  ): Promise<BundleEntity & { finalPrice: number }> {
    const bundle = await this.repo.findById(bundleId);
    if (!bundle) throw new NotFoundException('Không tìm thấy sản phẩm !!!');

    const updateData: Prisma.BundleUpdateInput = {
      modifiedby: 'admin',
      modifiedtime: now(),
    };

    if (dto.name) updateData.name = dto.name;
    if (dto.description) updateData.description = dto.description;
    if (dto.priceStrategy) updateData.priceStrategy = dto.priceStrategy;
    if (dto.discountValue) {
      updateData.discountValue = new Prisma.Decimal(dto.discountValue);
    }
    if (dto.fixedPrice) {
      updateData.fixedPrice = dto.fixedPrice? new Prisma.Decimal(dto.fixedPrice) : null;
    }

    const updated = await this.repo.update(bundleId, updateData);
    return this.withFinalPrice(updated);
  }

  // async addItem(bundleId: bigint, dto: AddItemDto) {
  //   const bundle = await this.repo.findById(bundleId);
  //   if (!bundle) throw new NotFoundException('Không tìm thấy sản phẩm !!!');

  //   const variantIdBigInt = BigInt(dto.variantId);

  //   const exists = bundle.items?.some(item => item.variantId === variantIdBigInt);
  //   if (exists) throw new BadRequestException('Variant đã tồn tại');

  //   await this.repo.addItem({
  //     bundleId,
  //     variantId: variantIdBigInt,
  //     quantity: dto.quantity ?? null,
  //   });

  //   const updated = await this.repo.findById(bundleId);
  //   return this.withFinalPrice(updated!);
  // }

  async addItem(bundleId: bigint, dto: AddItemDto) {
    const bundle = await this.repo.findById(bundleId);
    if (!bundle) throw new NotFoundException('Không tìm thấy sản phẩm !!!');

    const bundleItems = bundle.items ?? [];
    if (bundleItems.some((item) => item.variantId === BigInt(dto.variantId))) {
      throw new BadRequestException('Tồn tại sản phẩm bên trong gói sản phẩm !!!');
    }

    await this.repo.addItem({
      bundleId,
      variantId: BigInt(dto.variantId),
      quantity: dto.quantity ?? null,
    });

    const updatedBundle = await this.repo.findById(bundleId);
    return this.withFinalPrice(updatedBundle!);
  }
  
  async removeItem(bundleItemId: bigint) {
    const exists = await this.repo.findItemById(bundleItemId);
    if (!exists) throw new NotFoundException('Không tìm thấy danh sách sản phẩm !!!');

    await this.repo.removeItem(bundleItemId);
    return { message: 'Đã xóa sản phẩm thành công !!!' };
  }

  // === PRIVATE: Tính tổng giá ===
  private withFinalPrice(bundle: BundleEntity): BundleEntity & { finalPrice: number } {
    const bundleItems = bundle.items ?? [];
    const sum = bundleItems.reduce((acc, item) => {
      const price = new Prisma.Decimal(item.productVariant.price ?? 0);
      const qty = new Prisma.Decimal(item.quantity ?? 0);
      return acc.plus(price.mul(qty));
    }, new Prisma.Decimal(0));
  
    let finalPrice: Prisma.Decimal = sum;
  
    switch (bundle.priceStrategy) {
      case PriceStrategy.FIXED:
        if (bundle.fixedPrice != null) {
          finalPrice = new Prisma.Decimal(bundle.fixedPrice);
        }
        break;
      case PriceStrategy.PERCENT:
        const discount = new Prisma.Decimal(bundle.discountValue ?? 0);
        const discountAmount = sum.mul(discount).div(100);
        finalPrice = sum.minus(discountAmount);
        break;
      // case PriceStrategy.SUM: → mặc định là sum
    }
  
    return {
      ...bundle,
      finalPrice: Number(finalPrice.toFixed(2)), // ← Number + toFixed(2)
    };
  }

  async calculateBundlePrice(bundleId: bigint): Promise<number> {
    const bundle = await this.getBundle(bundleId);
    return bundle.finalPrice;
  }

  calculateFinalPrice(bundle: BundleEntity): number {
    const items = bundle.items ?? [];
    let sum = new Prisma.Decimal(0);

    for (const item of items) {
      const price = new Prisma.Decimal(item.productVariant.price) ?? 0;
      const qty = new Prisma.Decimal(item.quantity) ?? 0;
      sum = sum.plus(price.mul(qty));
    }

    let final: Prisma.Decimal = sum;

    switch (bundle.priceStrategy) {
      case PriceStrategy.FIXED:
        if (bundle.fixedPrice) final = new Prisma.Decimal(bundle.fixedPrice);
        break;
      case PriceStrategy.PERCENT:
        const discount = new Prisma.Decimal(bundle.discountValue ?? 0);
        final = sum.minus(sum.mul(discount).div(100));
        break;
    }

    return parseFloat(final.toFixed(2));
  }
}