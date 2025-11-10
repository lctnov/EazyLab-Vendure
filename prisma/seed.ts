// prisma/seed.ts
import { PrismaClient, PriceStrategy, Prisma } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');

  const safeDelete = async (model: any, name: string) => {
    try {
      await model.deleteMany();
      console.log(`Deleted all ${name}`);
    } catch (e: any) {
      if (e.code === 'P2021') {
        console.log(`${name} table does not exist yet, skipping...`);
      } else {
        throw e;
      }
    }
  };

  await safeDelete(prisma.orderLine, 'order_line');
  await safeDelete(prisma.bundleItem, 'bundle_item');
  await safeDelete(prisma.bundle, 'bundle');
  await safeDelete(prisma.productVariant, 'product_variant');
  await safeDelete(prisma.sYS_USERS, 'SYS_USERS');

  console.log('Old data cleared (or skipped).');

  // === HASH MẬT KHẨU ===
  const hashedAdmin = await hash('admin123', 10);
  const hashedCustomer = await hash('customer@123', 10);
  const hashedEmployee = await hash('employee@123', 10);

  await prisma.sYS_USERS.createMany({
    data: [
      {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedAdmin,
        role: 'admin',
        isactive: true,
        createdby: 'prisma',
        createdtime: new Date(),
      },
      {
        email: 'customer@example.com',
        username: 'customer',
        password: hashedCustomer,
        role: 'customer',
        isactive: true,
        createdby: 'prisma',
        createdtime: new Date(),
      },
      {
        email: 'employee@example.com',
        username: 'employee',
        password: hashedEmployee,
        role: 'employee',
        isactive: true,
        createdby: 'prisma',
        createdtime: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded SYS_USERS.');

  // =============================
  // PRODUCT VARIANTS – DÙNG Decimal
  // =============================
  const pv1 = await prisma.productVariant.create({
    data: {
      sku: 'VAR-001',
      name: 'Sữa rửa mặt dịu nhẹ',
      price: new Prisma.Decimal('119.99'),
      stockOnHand: 100,
    },
  });

  const pv2 = await prisma.productVariant.create({
    data: {
      sku: 'VAR-002',
      name: 'Kem chống nắng SPF50+',
      price: new Prisma.Decimal('179.50'),
      stockOnHand: 80,
    },
  });

  const pv3 = await prisma.productVariant.create({
    data: {
      sku: 'VAR-003',
      name: 'Serum Vitamin C',
      price: new Prisma.Decimal('249.99'),
      stockOnHand: 50,
    },
  });

  const pv4 = await prisma.productVariant.create({
    data: {
      sku: 'VAR-004',
      name: 'Kem dưỡng ẩm ban đêm',
      price: new Prisma.Decimal('299.99'),
      stockOnHand: 40,
    },
  });

  console.log('Created Product Variants:', {
    pv1: pv1.id,
    pv2: pv2.id,
    pv3: pv3.id,
    pv4: pv4.id,
  });

  // =============================
  // BUNDLES – DÙNG Decimal
  // =============================
  const bundleSum = await prisma.bundle.create({
    data: {
      code: 'BUNDLE_SUM',
      name: 'Combo dưỡng da cơ bản',
      description: 'Sữa rửa mặt + Kem chống nắng, tính tổng giá gốc',
      priceStrategy: PriceStrategy.SUM,
      discountValue: new Prisma.Decimal(0),
      fixedPrice: null,
      items: {
        create: [
          { productVariantId: pv1.id, quantity: 1 },
          { productVariantId: pv2.id, quantity: 1 },
        ],
      },
    },
    include: { items: true },
  });

  const bundleFixed = await prisma.bundle.create({
    data: {
      code: 'BUNDLE_FIXED',
      name: 'Combo chăm sóc da chuyên sâu',
      description: 'Giá cố định 399.99 cho bộ 3 sản phẩm cao cấp',
      priceStrategy: PriceStrategy.FIXED,
      discountValue: new Prisma.Decimal(0),
      fixedPrice: new Prisma.Decimal('399.99'),
      items: {
        create: [
          { productVariantId: pv2.id, quantity: 1 },
          { productVariantId: pv3.id, quantity: 1 },
          { productVariantId: pv4.id, quantity: 1 },
        ],
      },
    },
    include: { items: true },
  });

  const bundlePercent = await prisma.bundle.create({
    data: {
      code: 'BUNDLE_PERCENT',
      name: 'Combo dưỡng sáng da',
      description: 'Giảm 15% tổng giá sản phẩm trong combo',
      priceStrategy: PriceStrategy.PERCENT,
      discountValue: new Prisma.Decimal(15),
      fixedPrice: null,
      items: {
        create: [
          { productVariantId: pv1.id, quantity: 1 },
          { productVariantId: pv3.id, quantity: 1 },
        ],
      },
    },
    include: { items: true },
  });

  console.log('Created Bundles:', {
    sum: bundleSum.id,
    fixed: bundleFixed.id,
    percent: bundlePercent.id,
  });

  // =============================
  // ORDER
  // =============================
  const order1 = await prisma.order.upsert({
    where: { id: 1001n },
    update: {},
    create: {
      id: 1001n,
      userId: 'customer@example.com',
      status: 'CART',
      totalAmount: new Prisma.Decimal(0),
    },
  });

  // =============================
  // ORDER LINES – DÙNG Decimal.mul()
  // =============================
  await prisma.orderLine.createMany({
    data: [
      {
        orderId: order1.id,
        productVariantId: pv1.id,
        quantity: 2,
        unitPrice: pv1.price,
        totalPrice: pv1.price.mul(2), // DÙNG .mul()
      },
      {
        orderId: order1.id,
        bundleId: bundleFixed.id,
        quantity: 1,
        unitPrice: bundleFixed.fixedPrice ?? new Prisma.Decimal(0),
        totalPrice: bundleFixed.fixedPrice ?? new Prisma.Decimal(0),
      },
      {
        orderId: order1.id,
        bundleId: bundlePercent.id,
        quantity: 1,
        unitPrice: new Prisma.Decimal(0),
        totalPrice: new Prisma.Decimal(0),
      },
    ],
  });

  console.log('Created OrderLines.');
  console.log('\nSEEDING COMPLETED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });