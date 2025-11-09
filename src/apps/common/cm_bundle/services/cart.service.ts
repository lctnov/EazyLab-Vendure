import { PrismaService } from "@/libs/database/prisma.service";
import { InventoryService } from "./inventory.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  async addBundleToCart(bundleId: bigint, quantity: number) {
    const bundle = await this.prisma.bundle.findUnique({
      where: { id: bundleId },
      include: { items: { include: { productVariant: true } } },
    });

    if (!bundle) throw new Error('Bundle not found');

    // Reserve stock cho từng variant trong bundle
    for (const item of bundle.items) {
      await this.inventoryService.reserveStock(item.productVariantId, item.quantity * quantity);
    }

    // Tạo orderLine đại diện cho bundle
    const orderLine = await this.prisma.orderLine.create({
      data: {
        bundleId,
        quantity,
        unitPrice: this.calculateBundlePrice(bundle),
        totalPrice: this.calculateBundlePrice(bundle) * quantity,
        metadata: {
          items: bundle.items.map((i) => ({
            variant: i.productVariant.name,
            qty: i.quantity,
            price: i.productVariant.price,
          })),
        },
      },
    });

    return orderLine;
  }

  private calculateBundlePrice(bundle: any): number {
    const sum = bundle.items.reduce(
      (acc, i) => acc + i.productVariant.price * i.quantity,
      0,
    );

    switch (bundle.priceStrategy) {
      case 'sum':
        return sum;
      case 'fixed':
        return bundle.discountValue;
      case 'percent':
        return sum * (1 - bundle.discountValue / 100);
      default:
        return sum;
    }
  }
}
