-- CreateEnum
CREATE TYPE "PriceStrategy" AS ENUM ('SUM', 'FIXED', 'PERCENT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CART', 'PENDING', 'PAYMENT_SETTLED', 'SHIPPED', 'CANCELED', 'EXPIRED');

-- CreateTable
CREATE TABLE "SYS_USERS" (
    "userId" BIGSERIAL NOT NULL,
    "rowguid" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(200) NOT NULL,
    "expiredate" TIMESTAMP(6),
    "birthday" TIMESTAMP(6),
    "address" VARCHAR(500),
    "telphone" VARCHAR(50),
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "role" VARCHAR(20) NOT NULL,
    "createdby" VARCHAR(20) NOT NULL,
    "createdtime" TIMESTAMP(6) NOT NULL,
    "modifiedby" VARCHAR(20),
    "modifiedtime" TIMESTAMP(6),

    CONSTRAINT "SYS_USERS_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "bundle" (
    "bundleId" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "priceStrategy" "PriceStrategy" NOT NULL DEFAULT 'SUM',
    "discountValue" DECIMAL(10,2) NOT NULL,
    "fixedPrice" DECIMAL(10,2),
    "createdby" VARCHAR(20) NOT NULL,
    "createdtime" TIMESTAMP(6) NOT NULL,
    "modifiedby" VARCHAR(20),
    "modifiedtime" TIMESTAMP(6),

    CONSTRAINT "bundle_pkey" PRIMARY KEY ("bundleId")
);

-- CreateTable
CREATE TABLE "bundle_item" (
    "bundleItemId" BIGSERIAL NOT NULL,
    "bundleId" BIGINT NOT NULL,
    "variantId" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdby" VARCHAR(20) NOT NULL,
    "createdtime" TIMESTAMP(6) NOT NULL,
    "modifiedby" VARCHAR(20),
    "modifiedtime" TIMESTAMP(6),

    CONSTRAINT "bundle_item_pkey" PRIMARY KEY ("bundleItemId")
);

-- CreateTable
CREATE TABLE "product_variant" (
    "variantId" BIGSERIAL NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stockOnHand" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "allocatedStock" INTEGER NOT NULL DEFAULT 0,
    "createdby" VARCHAR(20) NOT NULL,
    "createdtime" TIMESTAMP(6) NOT NULL,
    "modifiedby" VARCHAR(20),
    "modifiedtime" TIMESTAMP(6),

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("variantId")
);

-- CreateTable
CREATE TABLE "order" (
    "orderId" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'CART',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "createdby" VARCHAR(20) NOT NULL,
    "createdtime" TIMESTAMP(6) NOT NULL,
    "modifiedby" VARCHAR(20),
    "modifiedtime" TIMESTAMP(6),

    CONSTRAINT "order_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "order_line" (
    "orderLineId" BIGSERIAL NOT NULL,
    "orderId" BIGINT NOT NULL,
    "bundleId" BIGINT,
    "variantId" BIGINT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "metadata" JSONB,
    "createdby" VARCHAR(20) NOT NULL,
    "createdtime" TIMESTAMP(6) NOT NULL,
    "modifiedby" VARCHAR(20),
    "modifiedtime" TIMESTAMP(6),

    CONSTRAINT "order_line_pkey" PRIMARY KEY ("orderLineId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SYS_USERS_rowguid_key" ON "SYS_USERS"("rowguid");

-- CreateIndex
CREATE UNIQUE INDEX "SYS_USERS_email_key" ON "SYS_USERS"("email");

-- CreateIndex
CREATE INDEX "SYS_USERS_email_idx" ON "SYS_USERS"("email");

-- CreateIndex
CREATE INDEX "SYS_USERS_username_idx" ON "SYS_USERS"("username");

-- CreateIndex
CREATE INDEX "SYS_USERS_role_idx" ON "SYS_USERS"("role");

-- CreateIndex
CREATE INDEX "SYS_USERS_isactive_idx" ON "SYS_USERS"("isactive");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_code_key" ON "bundle"("code");

-- CreateIndex
CREATE INDEX "bundle_code_idx" ON "bundle"("code");

-- CreateIndex
CREATE INDEX "bundle_priceStrategy_idx" ON "bundle"("priceStrategy");

-- CreateIndex
CREATE INDEX "bundle_createdby_idx" ON "bundle"("createdby");

-- CreateIndex
CREATE INDEX "bundle_item_bundleId_idx" ON "bundle_item"("bundleId");

-- CreateIndex
CREATE INDEX "bundle_item_variantId_idx" ON "bundle_item"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_item_bundleId_variantId_key" ON "bundle_item"("bundleId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_sku_key" ON "product_variant"("sku");

-- CreateIndex
CREATE INDEX "product_variant_sku_idx" ON "product_variant"("sku");

-- CreateIndex
CREATE INDEX "order_userId_status_idx" ON "order"("userId", "status");

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");

-- CreateIndex
CREATE INDEX "order_createdby_idx" ON "order"("createdby");

-- CreateIndex
CREATE INDEX "order_line_orderId_idx" ON "order_line"("orderId");

-- CreateIndex
CREATE INDEX "order_line_bundleId_idx" ON "order_line"("bundleId");

-- CreateIndex
CREATE INDEX "order_line_variantId_idx" ON "order_line"("variantId");

-- AddForeignKey
ALTER TABLE "bundle_item" ADD CONSTRAINT "bundle_item_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundle"("bundleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_item" ADD CONSTRAINT "bundle_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("variantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SYS_USERS"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundle"("bundleId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("variantId") ON DELETE SET NULL ON UPDATE CASCADE;
