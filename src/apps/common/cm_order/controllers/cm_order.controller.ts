import { Controller, Get, Param, UseGuards, ParseIntPipe, Post} from '@nestjs/common';
import { CookieJwtGuard } from '../../guards/cookie-jwt.guard';
import { OrderService } from '../../cm_order/services/cm_order.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

@UseGuards(CookieJwtGuard)
@ApiTags('Quản lý đơn hàng')
@Controller('v1')
export class OrderController {
	constructor(private orderService: OrderService) {}

	@Post('approve/:orderId')
	@ApiOperation({ summary: 'Xác nhận thanh toán' })
	async settle(@Param('orderId', ParseIntPipe) orderId: bigint) {
		return this.orderService.settlePayment(orderId);
	}

	@Post('cancel/:orderId')
	@ApiOperation({ summary: 'Hủy đơn hàng' })
	async cancel(@Param('orderId', ParseIntPipe) orderId: bigint) {
		return this.orderService.cancelOrder(orderId);
	}

  	@Post('ship/:orderId')
	@ApiOperation({ summary: 'Giao hàng (giảm tồn kho thực)' })
	async ship(@Param('orderId', ParseIntPipe) orderId: bigint) {
	return this.orderService.shipOrder(orderId);
	}
}