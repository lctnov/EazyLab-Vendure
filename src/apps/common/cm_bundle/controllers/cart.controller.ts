import { Body, Controller, Post, Param, Req } from '@nestjs/common';
import { CartService } from '../services/cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('bundle/:id')
  async addBundle(
    @Req() req: any,
    @Param('id') bundleId: string,
    @Body('quantity') quantity: number = 1,
  ) {
    const userId = req.user.sub; // từ JWT
    return this.cartService.addBundleToCart(userId, bundleId, quantity);
  }
}