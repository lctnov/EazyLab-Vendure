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
	
	@Post('create')
	@ApiOperation({ summary: 'Thêm bundle vào giỏ hàng' })
	@ApiBearerAuth()
	@ApiBody({ type: AddBundleDto })
	@ApiResponse({ status: 201, description: 'Thêm thành công, trả về OrderLine cha' })
	async addBundleToCart(
	@Req() req: Request & { user: any },
	@Body() dto: AddBundleDto,
	) {
		const userId = req.user.rowguid;
		return this.cartService.addBundleToCart(userId, BigInt(dto.bundleId), dto.quantity);
	}
  }