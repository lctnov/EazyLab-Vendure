import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/libs/database/prisma.service';
import { Transactional } from '@nestjs-cls/transactional';
import { Prisma } from '@prisma/client';

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
      // 1. Lock row + lấy stock hiện tại
      const result = await this.prisma.$queryRaw<
        Array<{ stockOnHand: Prisma.Decimal; reservedStock: Prisma.Decimal }>
      >`
        SELECT "stockOnHand", "reservedStock"
        FROM "ProductVariant"
        WHERE variantId = ${item.variantId}
        FOR UPDATE
      `;

      if (result.length === 0) {
        throw new BadRequestException(`Không tìm thấy hàng tồn kho theo: ${item.variantId}`);
      }

      const { stockOnHand, reservedStock } = result[0];
      const available = stockOnHand.minus(reservedStock);

      if (available.lessThan(item.quantity)) {
        throw new BadRequestException(
          `Không đủ sản phẩm theo ${item.variantId}. Có sẵn: ${available}, Yêu cầu: ${item.quantity}`,
        );
      }

      // 2. Tăng reservedStock
      const updateResult = await this.prisma.$executeRaw`
        UPDATE "ProductVariant"
        SET "reservedStock" = "reservedStock" + ${Prisma.raw(String(item.quantity))}
        WHERE variantId = ${item.variantId}
      `;

      if (updateResult === 0) {
        throw new BadRequestException(`Không thể giữ sản phẩm trong kho ${item.variantId}`);
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
        UPDATE "ProductVariant"
        SET
          "stockOnHand" = "stockOnHand" - ${Prisma.raw(String(item.quantity))},
          "reservedStock" = "reservedStock" - ${Prisma.raw(String(item.quantity))}
        WHERE variantId = ${item.variantId}
          AND "reservedStock" >= ${Prisma.raw(String(item.quantity))}
      `;

      if (result === 0) {
        throw new BadRequestException(
          `Không phân bổ được sản phẩm hàng tồn kho, do không đủ hàng tồn kho dự trữ ${item.variantId}`,
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
        UPDATE "ProductVariant"
        SET "reservedStock" = GREATEST("reservedStock" - ${Prisma.raw(String(item.quantity))}, 0)
        WHERE variantId = ${item.variantId}
      `;
    }
  }
}