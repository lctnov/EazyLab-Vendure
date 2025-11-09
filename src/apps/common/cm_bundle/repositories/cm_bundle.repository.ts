import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/database/prisma.service';
import { BundleEntity, BundleItemEntity } from '../entities/cm_bundle.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class CmBundleRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeItems = { include: { items: true } };

  // -----------------------------
  // Bundle queries
  // -----------------------------

  async findAll(): Promise<BundleEntity[]> {
    return this.prisma.bundle.findMany(this.includeItems);
  }

  async findById(id: bigint) {
    return this.prisma.bundle.findUnique({
      where: { id },
      include: { items: true }, // 👈 thêm dòng này
    });
  }
  

  async findByCode(code: string): Promise<BundleEntity | null> {
    return this.prisma.bundle.findUnique({
      where: { code },
      ...this.includeItems,
    });
  }

  async create(data: Prisma.BundleCreateInput): Promise<BundleEntity> {
    return this.prisma.bundle.create({
      data,
      ...this.includeItems,
    });
  }

  async update(id: bigint, data: Prisma.BundleUpdateInput): Promise<BundleEntity> {
    return this.prisma.bundle.update({
      where: { id },
      data,
      ...this.includeItems,
    });
  }

  async delete(id: bigint): Promise<void> {
    await this.prisma.bundle.delete({ where: { id } });
  }

  // -----------------------------
  // Bundle item queries
  // -----------------------------

  async findItemById(id: bigint): Promise<BundleItemEntity | null> {
    return this.prisma.bundleItem.findUnique({ where: { id } });
  }

  async findItemsByBundle(bundleId: bigint): Promise<BundleItemEntity[]> {
    return this.prisma.bundleItem.findMany({ where: { bundleId } });
  }

  async addItem(data: { bundleId: bigint; productVariantId: bigint; quantity: number }) {
    return this.prisma.bundleItem.create({
      data: {
        bundleId: data.bundleId,
        productVariantId: data.productVariantId,
        quantity: data.quantity,
      },
    });
  }
  

  async removeItem(itemId: bigint): Promise<void> {
    await this.prisma.bundleItem.delete({ where: { id: itemId } });
  }
}
