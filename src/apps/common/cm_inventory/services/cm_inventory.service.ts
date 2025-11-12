import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/libs/database/prisma.service';
import { Transactional } from '@nestjs-cls/transactional';

interface StockItem {
  variantId: bigint;
  quantity: number;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reserve stock (atomic + row lock)
   */
  @Transactional()
  async reserveStock(items: StockItem[]) {
    for (const item of items) {
      // 1. Lock row + lấy stock hiện tại từ product_variant
      const result = await this.prisma.$queryRaw<
        Array<{ stockOnHand: number; reservedStock: number }>
      >`
        SELECT "stockOnHand", "reservedStock"
        FROM "product_variant"
        WHERE "variantId" = ${item.variantId}
        FOR UPDATE
      `;

      if (result.length === 0) {
        throw new BadRequestException(`Không tìm thấy variantId: ${item.variantId}`);
      }

      const { stockOnHand, reservedStock } = result[0];
      const available = stockOnHand - reservedStock;

      if (available < item.quantity) {
        throw new BadRequestException(
          `Không đủ hàng (variantId: ${item.variantId}). Có: ${available}, Cần: ${item.quantity}`
        );
      }

      // 2. Tăng reservedStock
      const updated = await this.prisma.$executeRaw`
        UPDATE "product_variant"
        SET "reservedStock" = "reservedStock" + ${item.quantity}
        WHERE "variantId" = ${item.variantId}
          AND "stockOnHand" - "reservedStock" >= ${item.quantity}
      `;

      if (updated === 0) {
        throw new BadRequestException(`Không thể giữ chỗ kho cho variantId: ${item.variantId}`);
      }
    }
  }

  /**
   * Allocate stock (khi xác nhận đơn hàng)
   */
  @Transactional()
  async allocateStock(items: StockItem[]) {
    for (const item of items) {
      const result = await this.prisma.$executeRaw`
        UPDATE "product_variant"
        SET
          "stockOnHand" = "stockOnHand" - ${item.quantity},
          "reservedStock" = "reservedStock" - ${item.quantity},
          "allocatedStock" = "allocatedStock" + ${item.quantity}
        WHERE "variantId" = ${item.variantId}
          AND "reservedStock" >= ${item.quantity}
      `;

      if (result === 0) {
        throw new BadRequestException(
          `Không đủ hàng dự trữ để phân bổ cho variantId: ${item.variantId}`
        );
      }
    }
  }

  /**
   * Release reserved stock (hủy giỏ, hết hạn, v.v.)
   */
  @Transactional()
  async releaseReservedStock(items: StockItem[]) {
    for (const item of items) {
      await this.prisma.$executeRaw`
        UPDATE "product_variant"
        SET "reservedStock" = GREATEST("reservedStock" - ${item.quantity}, 0)
        WHERE "variantId" = ${item.variantId}
      `;
    }
  }
}