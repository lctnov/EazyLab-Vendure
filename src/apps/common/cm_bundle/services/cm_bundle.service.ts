// src/apps/common/cm_bundle/services/cm_bundle.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CmBundleRepository } from '../repositories/cm_bundle.repository';
import { CreateBundleDto } from '../dto/create-cm_bundle.dto';
import { UpdateBundleDto } from '../dto/update-cm_bundle.dto';
import { AddItemDto } from '../dto/add-item.dto';
import { PrismaService } from '@libs/database/prisma.service';
import { PriceStrategy, Prisma } from '@prisma/client';

@Injectable()
export class CmBundleService {
  constructor(
    private repo: CmBundleRepository,
    private prisma: PrismaService,
  ) {}

  async getBundles() {
    const bundles = await this.repo.findAll();
    return bundles.map(b => this.withFinalPrice(b));
  }

  async getBundle(id: bigint) {
    const bundle = await this.repo.findById(id);
    if (!bundle) throw new NotFoundException('Bundle not found');
    return this.withFinalPrice(bundle);
  }

  async createBundle(dto: CreateBundleDto) {
    const exists = await this.repo.findByCode(dto.code);
    if (exists) throw new BadRequestException('Bundle code already exists');

    const bundle = await this.repo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      priceStrategy: dto.priceStrategy,
      discountValue: dto.discountValue,
      fixedPrice: dto.fixedPrice ?? null,
      items: dto.items
        ? {
            create: dto.items.map((i) => ({
              productVariantId: BigInt(i.productVariantId),
              quantity: i.quantity,
            })),
          }
        : undefined,
    });

    return this.withFinalPrice(bundle);
  }

  async updateBundle(id: bigint, dto: UpdateBundleDto) {
    const bundle = await this.repo.findById(id);
    if (!bundle) throw new NotFoundException('Bundle not found');

    // CHUYỂN DTO → PRISMA INPUT
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.priceStrategy !== undefined) updateData.priceStrategy = dto.priceStrategy;
    if (dto.discountValue !== undefined) updateData.discountValue = dto.discountValue;
    if (dto.fixedPrice !== undefined) updateData.fixedPrice = dto.fixedPrice;

    const updated = await this.repo.update(id, updateData);
    return this.withFinalPrice(updated);
  }

  async addItem(bundleId: bigint, dto: AddItemDto) {
    const bundle = await this.repo.findById(bundleId);
    if (!bundle) throw new NotFoundException('Bundle not found');

    const items = bundle.items ?? [];
    if (items.some((i: any) => i.productVariantId === BigInt(dto.productVariantId))) {
      throw new BadRequestException('Variant already in bundle');
    }

    const newItem = await this.repo.addItem({
      bundleId,
      productVariantId: BigInt(dto.productVariantId),
      quantity: dto.quantity,
    });

    const updatedBundle = await this.repo.findById(bundleId);
    return this.withFinalPrice(updatedBundle!);
  }

  async removeItem(itemId: bigint) {
    const exists = await this.repo.findItemById(itemId);
    console.log('exists', exists);
    
    if (!exists) throw new NotFoundException('Item not found');

    await this.repo.removeItem(itemId);
    return { message: 'Item removed successfully' };
  }

  private withFinalPrice(bundle: any) {
    const items = bundle.items ?? [];
  const sum = items.reduce((acc: Prisma.Decimal, item: any) => {
    const price = new Prisma.Decimal(item.productVariant.price);
    const qty = new Prisma.Decimal(item.quantity);
    return acc.plus(price.mul(qty));
  }, new Prisma.Decimal(0));

  let finalPrice: Prisma.Decimal = sum;

  switch (bundle.priceStrategy) {
    case PriceStrategy.SUM:
      finalPrice = sum;
      break;
    case PriceStrategy.FIXED:
      finalPrice = bundle.fixedPrice ?? sum;
      break;
    case PriceStrategy.PERCENT:
      const discount = new Prisma.Decimal(bundle.discountValue ?? 0);
      finalPrice = sum.minus(sum.mul(discount).div(100));
      break;
  }

  return {
    ...bundle,
    finalPrice: parseFloat(finalPrice.toString()), // Chuyển sang number để trả API
  };
  }

  async calculateBundlePrice(bundleId: bigint): Promise<number> {
    const bundle = await this.getBundle(bundleId);
    return bundle.finalPrice;
  }
}