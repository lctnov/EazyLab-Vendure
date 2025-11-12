// src/apps/common/cm_order/services/cm_order.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/libs/database/prisma.service';
import { InventoryService } from '../../cm_inventory/services/cm_inventory.service';
import { Transactional } from '@nestjs-cls/transactional';
import { ORDER_WITH_BUNDLE_ITEMS_INCLUDE } from '@/libs/constants/order.constants';

type StockItem = { variantId: bigint; quantity: number };

@Injectable()
export class OrderService {
	constructor(
		private prisma: PrismaService,
		private inventoryService: InventoryService,
	) {}

	private extractStockItems(lines: any[]): StockItem[] {
		return lines
		.filter((p): p is typeof p & { bundle: { items: any[] } } => 
			p.bundleId && Array.isArray(p.bundle?.items)
		)
		.flatMap(line =>
			line.bundle.items.map((item: any) => ({
			variantId: BigInt(item.variantId),
			quantity: Math.max(0, item.quantity * line.quantity),
			}))
		);
	}

	@Transactional()
	async settlePayment(orderId: bigint) {
		const order = await this.prisma.order.findUnique({
		where: { orderId: orderId, status: 'CART' },
		include: ORDER_WITH_BUNDLE_ITEMS_INCLUDE,
		});

		if (!order) throw new NotFoundException('Không tìm thấy đơn hàng !!!');
		if (!order.orderLines?.length) throw new BadRequestException('Đơn hàng không có sản phẩm !!!');

		const items = this.extractStockItems(order.orderLines);
		if (items.length > 0) await this.inventoryService.allocateStock(items);

		await this.prisma.order.update({
			where: { orderId: orderId },
			data: { status: 'PAYMENT_SETTLED' },
		});

		return { success: true, orderId: orderId.toString() };
	}

	@Transactional()
	async shipOrder(orderId: bigint) {
		const order = await this.prisma.order.findUnique({
			where: { orderId, status: 'PAYMENT_SETTLED' },
			include: ORDER_WITH_BUNDLE_ITEMS_INCLUDE,
		  });
		
		  if (!order) throw new NotFoundException('Đơn hàng chưa thanh toán');
		
		  await this.prisma.order.update({
			where: { orderId },
			data: { status: 'SHIPPED' },
		  });
		
		  return { success: true, orderId: orderId.toString() };
	}

	@Transactional()
	async cancelOrder(orderId: bigint) {
		const order = await this.prisma.order.findUnique({
		where: { orderId: orderId },
		include: ORDER_WITH_BUNDLE_ITEMS_INCLUDE,
		});

		if (!order) throw new NotFoundException('Không tìm thấy đơn hàng !!!');

		const items = this.extractStockItems(order.orderLines ?? []);
		if (items && items.length) await this.inventoryService.releaseReservedStock(items);

		await this.prisma.order.update({
		where: { orderId: orderId },
		data: { status: 'CANCELED' },
		});

		return { success: true, orderId: orderId.toString() };
	}
  	
}