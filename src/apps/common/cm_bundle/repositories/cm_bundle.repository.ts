import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database/prisma.service';
import { BundleEntity, BundleItemEntity } from '../entities/cm_bundle.entity';
import { Prisma } from '@prisma/client';
import { now } from '@/libs/utils/date.util';

@Injectable()
export class CmBundleRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly bundleInclude = {
    include: {
      items: {
        include: {
          productVariant: {
            select: {
              variantId: true,
              name: true,
              price: true,
              sku: true,
            },
          },
        },
      },
    },
  } as const;

  // =============================
  // Bundle Queries
  // =============================

  async findAll(): Promise<BundleEntity[]> {
    return this.prisma.bundle.findMany(this.bundleInclude);
  }

  async findById(bundleId: bigint): Promise<BundleEntity | null> {
    return this.prisma.bundle.findUnique({
      where: { bundleId: bundleId },
      ...this.bundleInclude,
    });
  }

  async findByCode(code: string): Promise<BundleEntity | null> {
    return this.prisma.bundle.findUnique({
      where: { code },
      ...this.bundleInclude,
    });
  }

  async create(data: Prisma.BundleCreateInput): Promise<BundleEntity> {
    return this.prisma.bundle.create({
      data,
      ...this.bundleInclude,
    });
  }

  async update(bundleId: bigint, data: Prisma.BundleUpdateInput): Promise<BundleEntity> {
    return this.prisma.bundle.update({
      where: { bundleId: bundleId },
      data,
      ...this.bundleInclude,
    });
  }

  async delete(bundleId: bigint): Promise<void> {
    await this.prisma.bundle.delete({ where: { bundleId: bundleId } });
  }

  // =============================
  // Bundle Item Queries
  // =============================

  async findItemById(bundleItemId: bigint): Promise<BundleItemEntity | null> {
    return this.prisma.bundleItem.findUnique({
      where: { bundleItemId: bundleItemId },
      include: {
        productVariant: {
          select: { variantId: true, name: true, price: true, sku: true },
        },
      },
    });
  }

  async findItemsByBundle(bundleId: bigint): Promise<BundleItemEntity[]> {
    return this.prisma.bundleItem.findMany({
      where: { bundleId },
      include: {
        productVariant: {
          select: { variantId: true, name: true, price: true, sku: true },
        },
      },
    });
  }

  async addItem(data: {
    bundleId: bigint;
    variantId: bigint;
    quantity: number;
  }): Promise<BundleItemEntity> {
    return this.prisma.bundleItem.create({
      data: {
        bundleId: data.bundleId,
        variantId: data.variantId,
        quantity: data.quantity,
        createdby: 'admin',
        createdtime: now(),
      },
      include: {
        productVariant: {
          select: { variantId: true, name: true, price: true, sku: true },
        },
      },
    });
  }

  async updateItemQuantity(bundleItemId: bigint, quantity: number): Promise<BundleItemEntity> {
    return this.prisma.bundleItem.update({
      where: { bundleItemId: bundleItemId },
      data: { quantity },
      include: {
        productVariant: {
          select: { variantId: true, name: true, price: true, sku: true },
        },
      },
    });
  }

  async removeItem(bundleItemId: bigint): Promise<void> {
    await this.prisma.bundleItem.delete({ where: { bundleItemId: bundleItemId } });
  }
}