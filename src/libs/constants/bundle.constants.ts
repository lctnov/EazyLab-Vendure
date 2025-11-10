// libs/constants/src/bundle.constants.ts
export const BUNDLE_STATUS = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	DRAFT: 'draft',
  } as const;
  
  export const BUNDLE_ERROR = {
	NOT_FOUND: 'Bundle not found',
	INVALID_STRATEGY: 'Invalid price strategy',
	OUT_OF_STOCK: 'Bundle out of stock',
  } as const;