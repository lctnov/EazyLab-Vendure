import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/libs/database/prisma.service';
import { InventoryService } from './inventory.service';
import { CmBundleService } from './cm_bundle.service';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly bundleService: CmBundleService,
  ) {}

  async addBundleToCart(
    userId: string,
    bundleId: string,
    quantity: number = 1,
  ): Promise<any> {
    this.validateQuantity(quantity);

    const bundle = await this.bundleService.getBundle(BigInt(bundleId));
    if (!bundle) throw new NotFoundException('Bundle not found');

    const totalPrice = bundle.finalPrice * quantity;

    let order = await this.prisma.order.findFirst({
      where: { userId, status: 'CART' },
    });

    if (!order) {
      order = await this.prisma.order.create({
        data: {
          userId,
          status: 'CART',
          totalAmount: 0,
        },
      });
    }

    for (const item of bundle.items) {
      const requiredStock = item.quantity * quantity;
      await this.inventoryService.reserveStock(item.productVariant.id, requiredStock);
    }

    const orderLine = await this.prisma.orderLine.create({
      data: {
        orderId: order.id,
        bundleId: bundle.id,
        quantity,
        unitPrice: bundle.finalPrice,
        totalPrice,
        metadata: {
          bundleCode: bundle.code,
          name: bundle.name,
          items: bundle.items.map((i: any) => ({
            sku: i.productVariant.sku,
            name: i.productVariant.name,
            price: i.productVariant.price,
            qty: i.quantity,
          })),
        },
      },
    });

    this.logger.log(`Bundle ${bundleId} x${quantity} added to cart for user ${userId}`);
    return orderLine;
  }

  private validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive integer');
    }
  }
}