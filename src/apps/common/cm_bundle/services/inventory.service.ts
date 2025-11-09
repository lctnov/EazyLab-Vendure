import { PrismaService } from "@/libs/database/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async reserveStock(variantId: bigint, quantity: number) {
    await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { reservedStock: { increment: quantity } },
    });
  }

  async allocateStock(variantId: bigint, quantity: number) {
    await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        reservedStock: { decrement: quantity },
        stockOnHand: { decrement: quantity },
        allocatedStock: { increment: quantity },
      },
    });
  }

  async releaseReservedStock(variantId: bigint, quantity: number) {
    await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { reservedStock: { decrement: quantity } },
    });
  }
}
