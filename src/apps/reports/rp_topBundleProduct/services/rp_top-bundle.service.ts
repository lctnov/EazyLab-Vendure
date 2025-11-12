import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@libs/database/prisma.service';

export interface TopBundleReport {
  bundleCode: string;
  bundleName: string;
  totalOrders: number;
  totalRevenue: string;
}

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async topBundles(
    from: Date,
    to: Date,
    limit: number = 10,
  ): Promise<TopBundleReport[]> {
    const result = await this.prisma.$queryRaw<
      Array<{
        bundleCode: string;
        bundleName: string;
        totalOrders: bigint;
        totalRevenue: any;
      }>
    >`
      SELECT
        b."code" AS "bundleCode",
        b."name" AS "bundleName",
        COUNT(DISTINCT ol."orderId") AS "totalOrders",
        SUM(ol."totalPrice") AS "totalRevenue"
      FROM "order_line" ol
      JOIN "bundle" b ON ol."bundleId" = b."bundleId"
      JOIN "order" o ON ol."orderId" = o."orderId"
      WHERE 
        ol."bundleId" IS NOT NULL
        AND o."status" = 'SHIPPED'
        AND o."createdtime" >= ${from}
        AND o."createdtime" < ${to}
      GROUP BY b."bundleId", b."code", b."name"
      ORDER BY "totalRevenue" DESC
      LIMIT ${limit}
    `;
    
    console.log('result', result.length);
    
    if (result.length === 0) {
      throw new NotFoundException('Không tìm thấy các gói sản phẩm nào trong khoảng thời gian này');
    }

    return result.map((row) => ({
      bundleCode: row.bundleCode,
      bundleName: row.bundleName,
      totalOrders: Number(row.totalOrders),
      totalRevenue: row.totalRevenue.toString(),
    }));
  }
}