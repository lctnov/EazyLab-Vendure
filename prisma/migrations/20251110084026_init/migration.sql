-- CreateEnum
CREATE TYPE "PriceStrategy" AS ENUM ('SUM', 'FIXED', 'PERCENT');

-- CreateTable
CREATE TABLE "SYS_USERS" (
    "id" BIGSERIAL NOT NULL,
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

    CONSTRAINT "SYS_USERS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceStrategy" "PriceStrategy" NOT NULL DEFAULT 'SUM',
    "discountValue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fixedPrice" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_item" (
    "id" BIGSERIAL NOT NULL,
    "bundleId" BIGINT NOT NULL,
    "productVariantId" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "bundle_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" BIGSERIAL NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "stockOnHand" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "allocatedStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CART',
    "totalAmount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_line" (
    "id" BIGSERIAL NOT NULL,
    "orderId" BIGINT NOT NULL,
    "bundleId" BIGINT,
    "productVariantId" BIGINT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "order_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SYS_USERS_rowguid_key" ON "SYS_USERS"("rowguid");

-- CreateIndex
CREATE UNIQUE INDEX "SYS_USERS_email_key" ON "SYS_USERS"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_code_key" ON "bundle"("code");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_item_bundleId_productVariantId_key" ON "bundle_item"("bundleId", "productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "order_userId_status_idx" ON "order"("userId", "status");

-- AddForeignKey
ALTER TABLE "bundle_item" ADD CONSTRAINT "bundle_item_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_item" ADD CONSTRAINT "bundle_item_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
