## Description

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


# Bundle Plugin (cm_bundle)

Entities:
- Bundle (id, code, name, description, priceStrategy: sum|fixed|percent, discountValue, fixedPrice, createdAt, updatedAt)
- BundleItem (id, bundleId, productVariantId, quantity)

Price rules:
- sum: total = sum(variant.price * quantity)
- fixed: total = bundle.fixedPrice
- percent: total = sum * (1 - discountValue/100)

API (GraphQL):
- Query:
  - bundles(): [Bundle]
  - bundle(id): Bundle
- Mutation:
  - createBundle(input: CreateBundleDto)
  - updateBundle(id, input: UpdateBundleDto)
  - addBundleItem(bundleId, productVariantId, quantity)
  - removeBundleItem(id)

Validation:
- No duplicate variant inside same bundle (unique constraint on bundleId+productVariantId)
- quantity >= 1

Order integration:
- createOrderLineRepresentation(bundleId, useParentChild=false)
  - if useParentChild=false -> returns a single OrderLine object with metadata.items listing internal items
  - if useParentChild=true  -> returns { parent, children } objects (one parent OrderLine and child OrderLines)

Inventory Reservation (Core B):
- Placeholder method reserveInventoryForBundle(bundleId, bundleQuantity) demonstrates logic:
  - lock variant rows (SELECT ... FOR UPDATE) and increment reservedStock
  - when order settled, move reserved -> reduce stockOnHand and reservedStock
  - when order cancelled, decrement reservedStock

Note:
- Replace `getVariantPrice` and direct SQL on `product_variant` with your app's ProductVariant service/repository.
- If integrating into Vendure, use Vendure's services for product variant lookup and for hooking into Order lifecycle events.
