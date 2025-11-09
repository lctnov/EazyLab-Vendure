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
  description?: string;
  priceStrategy: 'sum' | 'fixed' | 'percent';
  discountValue?: number;
  fixedPrice?: number;
  createdAt: Date;
  updatedAt: Date;
  items?: BundleItemEntity[];
}
