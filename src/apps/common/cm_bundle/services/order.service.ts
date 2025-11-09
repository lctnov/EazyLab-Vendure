import { PrismaService } from "@/libs/database/prisma.service";
import { InventoryService } from "./inventory.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService, private readonly inventoryService: InventoryService) {}

  async settleOrder(orderId: bigint) {
    const orderLines = await this.prisma.orderLine.findMany({ where: { orderId } });

    for (const line of orderLines) {
      if (line.productVariantId) {
        await this.inventoryService.allocateStock(line.productVariantId, line.quantity);
      } else if (line.bundleId) {
        const bundleItems = await this.prisma.bundleItem.findMany({
          where: { bundleId: line.bundleId },
        });
        for (const item of bundleItems) {
          await this.inventoryService.allocateStock(item.productVariantId, item.quantity * line.quantity);
        }
      }
    }
  }

  async cancelOrder(orderId: bigint) {
    const orderLines = await this.prisma.orderLine.findMany({ where: { orderId } });

    for (const line of orderLines) {
      if (line.productVariantId) {
        await this.inventoryService.releaseReservedStock(line.productVariantId, line.quantity);
      } else if (line.bundleId) {
        const bundleItems = await this.prisma.bundleItem.findMany({
          where: { bundleId: line.bundleId },
        });
        for (const item of bundleItems) {
          await this.inventoryService.releaseReservedStock(item.productVariantId, item.quantity * line.quantity);
        }
      }
    }
  }
}
