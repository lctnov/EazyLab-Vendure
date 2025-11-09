import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedAdmin = await hash('admin123', 10);
  const hashedCustomer = await hash('customer@123', 10);
  const hashedEmployee = await hash('employee@123', 10);
  
  // console.log('🧹 Clearing old data...');
  // await prisma.orderLine.deleteMany();
  // await prisma.bundleItem.deleteMany();
  // await prisma.bundle.deleteMany();
  // await prisma.productVariant.deleteMany();

  // --- Seed SYS_USERS ---
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


  // =============================
  // PRODUCT VARIANTS
  // =============================
  const productVariants = await prisma.productVariant.createMany({
    data: [
      { sku: 'VAR-001', name: 'Sữa rửa mặt dịu nhẹ', price: 120000, stockOnHand: 100 },
      { sku: 'VAR-002', name: 'Kem chống nắng SPF50+', price: 180000, stockOnHand: 80 },
      { sku: 'VAR-003', name: 'Serum Vitamin C', price: 250000, stockOnHand: 50 },
      { sku: 'VAR-004', name: 'Kem dưỡng ẩm ban đêm', price: 300000, stockOnHand: 40 },
    ],
  });

  console.log('✅ Created Product Variants.');

  const [pv1, pv2, pv3, pv4] = await prisma.productVariant.findMany({
    orderBy: { id: 'asc' },
  });

  // =============================
  // BUNDLES
  // =============================

  // Bundle 1 - Tổng giá (sum)
  const bundleSum = await prisma.bundle.create({
    data: {
      code: 'BUNDLE_SUM',
      name: 'Combo dưỡng da cơ bản',
      description: 'Sữa rửa mặt + Kem chống nắng, tính tổng giá gốc',
      priceStrategy: 'sum',
      discountValue: 0,
      items: {
        create: [
          { productVariantId: pv1.id, quantity: 1 },
          { productVariantId: pv2.id, quantity: 1 },
        ],
      },
    },
    include: { items: true },
  });

  // Bundle 2 - Giá cố định (fixed)
  const bundleFixed = await prisma.bundle.create({
    data: {
      code: 'BUNDLE_FIXED',
      name: 'Combo chăm sóc da chuyên sâu',
      description: 'Giá cố định 400k cho bộ 3 sản phẩm cao cấp',
      priceStrategy: 'fixed',
      discountValue: 400000,
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

  // Bundle 3 - Giảm phần trăm (percent)
  const bundlePercent = await prisma.bundle.create({
    data: {
      code: 'BUNDLE_PERCENT',
      name: 'Combo dưỡng sáng da',
      description: 'Giảm 15% tổng giá sản phẩm trong combo',
      priceStrategy: 'percent',
      discountValue: 15,
      items: {
        create: [
          { productVariantId: pv1.id, quantity: 1 },
          { productVariantId: pv3.id, quantity: 1 },
        ],
      },
    },
    include: { items: true },
  });

  console.log('✅ Created Bundles & BundleItems.');

  // =============================
  // ORDER LINES (demo)
  // =============================
  const orders = await prisma.orderLine.createMany({
    data: [
      {
        orderId: 1001,
        productVariantId: pv1.id,
        quantity: 2,
        unitPrice: pv1.price,
        totalPrice: pv1.price * 2,
      },
      {
        orderId: 1001,
        bundleId: bundleFixed.id,
        quantity: 1,
        unitPrice: bundleFixed.discountValue ?? 0,
        totalPrice: bundleFixed.discountValue ?? 0,
      },
      {
        orderId: 1002,
        bundleId: bundlePercent.id,
        quantity: 1,
        unitPrice: 0, // demo: sẽ tính theo công thức nếu có service tính giá
        totalPrice: 0,
      },
    ],
  });

  console.log('✅ Created OrderLines.');

  // =============================
  // Summary output
  // =============================
  const bundles = [bundleSum, bundleFixed, bundlePercent];
  console.log('\n💰 Bundle Summary:');
  for (const b of bundles) {
    console.log(`- ${b.code}: strategy=${b.priceStrategy}, discount=${b.discountValue}`);
  }

  console.log('\n🌱 Seeding completed successfully!');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
