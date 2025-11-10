export interface BundleItemEntity {
  id: bigint;
  bundleId: bigint;
  productVariantId: bigint;
  quantity: number;
}

export interface BundleEntity {
  id: bigint;
  code: string;
  name: string;
  description?: string | null;
  priceStrategy: 'sum' | 'fixed' | 'percent';
  discountValue?: number | null;
  fixedPrice?: number;
  createdAt: Date;
  updatedAt: Date;
  items?: BundleItemEntity[];
}
