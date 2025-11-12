import { Body, Controller, Post, Get, Param, Req, UsePipes, ValidationPipe, ParseIntPipe, UseGuards, NotFoundException } from '@nestjs/common';
import { CartService } from '../services/cm_cart.service';
import { AddBundleDto } from '../dto/add-bundle.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CookieJwtGuard } from '../../guards/cookie-jwt.guard';
import type { Request } from 'express';
  
@UseGuards(CookieJwtGuard)
@ApiTags('Quản lý danh sách thanh toán')
@Controller('v1')
export class CartController {
	constructor(private readonly cartService: CartService) {}
	
	@Get('getOrderLine')
	@ApiOperation({ summary: 'Lấy giỏ hàng của người dùng (ẩn children lines)' })
	@ApiResponse({ status: 200, description: 'Lấy giỏ hàng thành công' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy giỏ hàng' })
	async getCart(@Req() req: Request) {
		const userId = req.user;
		if (!userId) {
			throw new NotFoundException('Không xác định được người dùng');
		}
		return this.cartService.getCart(userId.toString());
	}
	
	@Post('create/:cartID')
	@UsePipes(new ValidationPipe({ transform: true }))
	@ApiBearerAuth()
	@ApiOperation({
	  summary: 'Thêm sản phẩm vào giỏ hàng',
	  description:
		'Tạo danh sách đơn hàng đại diện cho sản phẩm với giá đã tính + dữ liệu chi tiết',
	})
	@ApiParam({
	  name: 'cartId',
	  description: 'Mã thanh toán của sản phẩm !!!',
	  example: 2,
	  type: 'number',
	})
	@ApiBody({
	  type: AddBundleDto,
	  description: 'Số lượng (tùy chọn, mặc định 1 !!!)',
	})
	@ApiResponse({
		status: 200,
		description: 'Danh sách đơn hàng đã được tạo !!!',
		schema: {
				example: {
					cartId: 101,
					orderId: 1001,
					bundleId: 2,
					quantity: 1,
					unitPrice: 399.99,
					totalPrice: 399.99,
					metadata: {
						bundleCode: 'BUNDLE_FIXED',
						name: 'Combo chăm sóc da chuyên sâu',
						priceStrategy: 'FIXED',
						finalPrice: 399.99,
						items: [
						{ sku: 'VAR-002', name: 'Kem chống nắng SPF50+', price: 179.5, quantity: 1 },
						{ sku: 'VAR-003', name: 'Serum Vitamin C', price: 249.99, quantity: 1 },
						{ sku: 'VAR-004', name: 'Kem dưỡng ẩm ban đêm', price: 299.99, quantity: 1 },
						],
					},
				},
		},
	})
	@ApiResponse({ status: 400, description: 'Số lượng hoặc sản phẩm trùng mã thanh toán !!!' })
	@ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm !!!' })
	async addBundle(
	@Req() req: Request & { user: any },
	@Param('bundleId', ParseIntPipe) bundleId: number,
	@Body() dto: AddBundleDto,
	) {
	  const userId = req.user.rowguid;
	  const quantity = dto.quantity ?? 1;
  
	  return this.cartService.addBundleToCart(userId, BigInt(bundleId), quantity);
	}
  }