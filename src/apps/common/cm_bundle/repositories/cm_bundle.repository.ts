import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database/prisma.service';
import { BundleEntity, BundleItemEntity } from '../entities/cm_bundle.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class CmBundleRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Gộp include 2 tầng: items + productVariant
  private readonly bundleInclude = {
    include: {
      items: {
        include: {
          productVariant: {
            select: {
              id: true,
              name: true,
              price: true,
              sku: true,
            },
          },
        },
      },
    },
  };

  // -----------------------------
  // Bundle queries
  // -----------------------------
  async findAll() {
    return await this.prisma.bundle.findMany(this.bundleInclude);
  }
  
  async findById(id: bigint): Promise<BundleEntity | null> {
    return this.prisma.bundle.findUnique({
      where: { id: Number(id) },
      ...this.bundleInclude,
    }) as unknown as BundleEntity | null;
  }

  async findByCode(code: string): Promise<BundleEntity | null> {
    return this.prisma.bundle.findUnique({
      where: { code },
      ...this.bundleInclude,
    }) as unknown as BundleEntity | null;
  }

  async create(data: Prisma.BundleCreateInput): Promise<BundleEntity> {
    return this.prisma.bundle.create({
      data,
      ...this.bundleInclude,
    }) as unknown as BundleEntity;
  }

  async update(id: bigint, data: Prisma.BundleUpdateInput): Promise<BundleEntity> {
    return this.prisma.bundle.update({
      where: { id: Number(id) },
      data,
      ...this.bundleInclude,
    }) as unknown as BundleEntity;
  }

  async delete(id: bigint): Promise<void> {
    await this.prisma.bundle.delete({ where: { id: Number(id) } });
  }

  // -----------------------------
  // Bundle item queries
  // -----------------------------

  async findItemById(id: bigint): Promise<BundleItemEntity | null> {
    return this.prisma.bundleItem.findUnique({
      where: { id: Number(id) },
      include: { productVariant: true },
    });
  }

  async findItemsByBundle(bundleId: bigint): Promise<BundleItemEntity[]> {
    return this.prisma.bundleItem.findMany({
      where: { bundleId: Number(bundleId) },
      include: { productVariant: true },
    });
  }

  async addItem(data: { bundleId: bigint; productVariantId: bigint; quantity: number }) {
    return this.prisma.bundleItem.create({
      data: {
        bundleId: Number(data.bundleId),
        productVariantId: Number(data.productVariantId),
        quantity: data.quantity,
      },
      include: { productVariant: true },
    });
  }

  async removeItem(itemId: bigint): Promise<void> {
    await this.prisma.bundleItem.delete({ where: { id: Number(itemId) } });
  }
}
