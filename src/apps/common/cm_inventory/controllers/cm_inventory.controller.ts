import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '@/libs/database/prisma.service';
import { CookieJwtGuard } from '../../guards/cookie-jwt.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(CookieJwtGuard)
@ApiTags('Quản lý hàng tồn kho')
@Controller('v1')
export class InventoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('get/:variantId')
  @ApiOperation({ summary: 'Tìm danh sách tồn kho theo mã' })
  async getStock(
    @Param('variantId', ParseIntPipe) variantId: bigint,
  ) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { variantId: variantId },
      select: { stockOnHand: true, reservedStock: true },
    });

    if (!variant) {
      throw new Error('Không tìm thấy hàng tồn kho !!!');
    }

    return {
      variantId: variantId.toString(),
      onHand: variant.stockOnHand,
      reserved: variant.reservedStock,
      available: variant.stockOnHand - variant.reservedStock,
    };
  }
}