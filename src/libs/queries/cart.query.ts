// src/libs/prisma/queries/cart.query.ts
import { Prisma } from '@prisma/client';

export const CART_SELECT = {
  orderId: true,
  totalAmount: true,
  orderLines: {
    where: { metadata: { path: ['$.isBundleItem'], not: true } },
    select: {
      orderLineId: true,
      bundleId: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      metadata: true,
      bundle: {
        select: {
          code: true,
          name: true,
          items: {
            select: {
              quantity: true,
              productVariant: {
                select: { sku: true, name: true, price: true },
              },
            },
          },
        },
      },
    },
    orderBy: { orderLineId: 'asc' },
  },
} satisfies Prisma.OrderSelect;