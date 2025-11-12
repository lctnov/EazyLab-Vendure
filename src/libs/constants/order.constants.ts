import { Prisma } from '@prisma/client';

export const ORDER_WITH_BUNDLE_ITEMS_INCLUDE = {
  orderLines: {
    include: {
      bundle: {
        include: {
          items: {
            select: {
				variantId: true,
              quantity: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;