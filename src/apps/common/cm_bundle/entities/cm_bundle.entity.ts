import { Decimal } from '@prisma/client/runtime/library';

export type BundleEntity = {
  bundleId: bigint;
  code: string;
  name: string;
  description: string | null;
  priceStrategy: 'SUM' | 'FIXED' | 'PERCENT';
  discountValue: Decimal;
  fixedPrice: Decimal | null;
  createdby: string;
  createdtime: Date;
  modifiedby: string | null;
  modifiedtime: Date | null;
  items: BundleItemEntity[];
};

export type BundleItemEntity = {
  bundleItemId: bigint;
  bundleId: bigint;
  variantId: bigint;
  quantity: number;
  createdby: string;
  createdtime: Date;
  modifiedby: string | null;
  modifiedtime: Date | null;
  productVariant: {
    variantId: bigint;
    name: string;
    price: Decimal;
    sku: string;
  };
};