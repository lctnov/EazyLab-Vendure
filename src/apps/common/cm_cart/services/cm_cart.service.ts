import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CmBundleService } from '../../cm_bundle/services/cm_bundle.service';
import { PrismaService } from '@libs/database/prisma.service';
import { InventoryService } from '../../cm_inventory/services/cm_inventory.service';
import { Transactional } from '@nestjs-cls/transactional';
import { CART_SELECT } from '@libs/queries/cart.query';
import { now } from '@/libs/utils/date.util';

@Injectable()
export class CartService {
  constructor(
    private readonly bundleService: CmBundleService,
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  // === GET CART ===
  async getCart(userGuid: string) {
    const user = await this.prisma.sYS_USERS.findUnique({
      where: { rowguid: userGuid },
      select: { userId: true },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const cart = await this.prisma.order.findFirst({
      where: { userId: user.userId, status: 'CART' },
      select: CART_SELECT,
    });

    if (!cart) throw new NotFoundException('Giỏ hàng trống');

    return cart;
  }

  @Transactional()
  async addBundleToCart(
    userGuid: string,
    bundleId: bigint,
    quantity: number = 1
  ) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Số lượng phải là số dương !!!');
    }

    // 1. Lấy userId từ rowguid
    const user = await this.prisma.sYS_USERS.findUnique({
      where: { rowguid: userGuid },
      select: { userId: true },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const userId = user.userId;

    // 2. LẤY BUNDLE
    const bundle = await this.prisma.bundle.findUnique({
      where: { bundleId },
      include: { items: { include: { productVariant: true } } },
    });

    if (!bundle) throw new NotFoundException('Không tìm thấy sản phẩm !!!');

    // 3. TÍNH GIÁ
    const finalPrice = this.bundleService.calculateFinalPrice(bundle);
    const unitPrice = new Prisma.Decimal(finalPrice);
    const totalPrice = unitPrice.mul(quantity);

    const originalSum = bundle.items.reduce((acc, item) => {
      const price = new Prisma.Decimal(item.productVariant.price);
      const qty = new Prisma.Decimal(item.quantity);
      return acc.plus(price.mul(qty));
    }, new Prisma.Decimal(0));

    // 4. RESERVE STOCK
    const itemsToReserve = bundle.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity * quantity,
    }));

    await this.inventoryService.reserveStock(itemsToReserve);

    // 5. TẠO/LẤY GIỎ HÀNG
    let order = await this.prisma.order.findFirst({
      where: { userId, status: 'CART' },
    });

    if (!order) {
      order = await this.prisma.order.create({
        data: {
          userId,
          status: 'CART',
          totalAmount: new Prisma.Decimal(0),
          createdby: 'admin',
          createdtime: now(),
        },
      });
    }

    // 6. TẠO ORDERLINE CHA
    const metadata = {
      bundleCode: bundle.code,
      strategy: bundle.priceStrategy,
      originalPrice: parseFloat(originalSum.toFixed(2)),
      finalPrice,
      items: bundle.items.map((item) => ({
        sku: item.productVariant.sku,
        name: item.productVariant.name,
        qty: item.quantity,
        price: item.productVariant.price.toString(),
      })),
      ...(bundle.priceStrategy === 'FIXED' && bundle.fixedPrice && {
        fixedPrice: bundle.fixedPrice.toString(),
      }),
      ...(bundle.priceStrategy === 'PERCENT' && bundle.discountValue && {
        discount: bundle.discountValue.toString(),
      }),
    };

    const parentLine = await this.prisma.orderLine.create({
      data: {
        orderId: order.orderId,
        bundleId,
        quantity,
        unitPrice,
        totalPrice,
        metadata,
        createdby: 'admin',
        createdtime: new Date(),
      },
    });

    // 6.2 CHILDREN LINES
    for (const item of bundle.items) {
      const childQty = item.quantity * quantity;
      await this.prisma.orderLine.create({
        data: {
          orderId: order.orderId,
          variantId: item.variantId,
          quantity: childQty,
          unitPrice: new Prisma.Decimal(0),
          totalPrice: new Prisma.Decimal(0),
          metadata: {
            isBundleItem: true,
            parentBundleLineId: parentLine.orderLineId.toString(),
            bundleCode: bundle.code,
            variantSku: item.productVariant.sku,
            originalQuantity: item.quantity,
          },
          createdby: 'admin',
          createdtime: now(),
        },
      });
    }

    // 7. CẬP NHẬT TỔNG TIỀN
    const payableLines = await this.prisma.orderLine.findMany({
      where: {
        orderId: order.orderId,
        OR: [
          { bundleId: { not: null } },
          { metadata: { path: ['$.isBundleItem'], not: true } },
        ],
      },
      select: { totalPrice: true },
    });

    const newTotal = payableLines.reduce(
      (acc, line) => acc.add(line.totalPrice),
      new Prisma.Decimal(0),
    );

    await this.prisma.order.update({
      where: { orderId: order.orderId },
      data: { totalAmount: newTotal },
    });

    return parentLine;
  }
}