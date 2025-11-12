// prisma/seed.ts
import { PrismaClient, PriceStrategy, OrderStatus } from '@prisma/client';
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

  console.log('Old data cleared.');

  // === HASH MẬT KHẨU ===
  const hashedAdmin = await hash('admin123', 10);
  const hashedCustomer = await hash('customer@123', 10);
  const hashedEmployee = await hash('employee@123', 10);

  // === SYS_USERS ===
  await prisma.sYS_USERS.createMany({
    data: [
      {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedAdmin,
        role: 'admin',
        isactive: true,
        createdby: 'admin',
        createdtime: new Date(),
      },
      {
        email: 'customer@example.com',
        username: 'customer',
        password: hashedCustomer,
        role: 'customer',
        isactive: true,
        createdby: 'admin',
        createdtime: new Date(),
      },
      {
        email: 'employee@example.com',
        username: 'employee',
        password: hashedEmployee,
        role: 'employee',
        isactive: true,
        createdby: 'admin',
        createdtime: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  const customer = await prisma.sYS_USERS.findUnique({ where: { email: 'customer@example.com' } });
  if (!customer) throw new Error('Customer not found');
  console.log('Seeded SYS_USERS.');

  // =============================
  // 10 PRODUCT VARIANTS – SỐ LẺ
  // =============================
  const variants = [
    { sku: 'VAR-001', name: 'Sữa rửa mặt dịu nhẹ', price: '119.99', stockOnHand: 100, createdby: 'admin', createdtime: new Date() },
    { sku: 'VAR-002', name: 'Kem chống nắng SPF50+', price: '179.50', stockOnHand: 80, createdby: 'admin', createdtime: new Date() },
    { sku: 'VAR-003', name: 'Serum Vitamin C', price: '249.99', stockOnHand: 50, createdby: 'admin', createdtime: new Date() },
    { sku: 'VAR-004', name: 'Kem dưỡng ẩm ban đêm', price: '299.99', stockOnHand: 40, createdby: 'admin', createdtime: new Date() },
    { sku: 'VAR-005', name: 'Tẩy trang dạng dầu', price: '89.90', stockOnHand: 120, createdby: 'admin', createdtime: new Date() },
    { sku: 'VAR-006', name: 'Mặt nạ ngủ', price: '159.00', stockOnHand: 70, createdby: 'admin', createdtime: new Date() },
    { sku: 'VAR-007', name: 'Nước hoa hồng', price: '99.50', stockOnHand: 90, createdby: 'admin', createdtime: new Date() },
    { sku: 'VAR-008', name: 'Kem trị mụn', price: '189.00', stockOnHand: 60, createdby: 'admin', createdtime: new Date() },
    { sku: 'VAR-009', name: 'Son dưỡng môi', price: '59.90', stockOnHand: 150, createdby: 'admin', createdtime: new Date() },
    { sku: 'VAR-010', name: 'Dầu gội đầu', price: '129.00', stockOnHand: 85, createdby: 'admin', createdtime: new Date() },
  ];

  await prisma.productVariant.createMany({ data: variants });
  const pvList = await prisma.productVariant.findMany({ orderBy: { variantId: 'asc' } });
  console.log(`Created ${pvList.length} ProductVariants.`);

  // =============================
  // 3 BUNDLES – LƯU ITEMS RIÊNG ĐỂ TRÁNH LỖI TS
  // =============================

  // 1. BND_STARTER: SUM
  const bundleStarterData = await prisma.bundle.create({
    data: {
      code: 'BND_STARTER',
      name: 'Combo dưỡng da cơ bản',
      description: 'Sữa rửa mặt + Kem chống nắng',
      priceStrategy: PriceStrategy.SUM,
      discountValue: '0.00',
      createdby: 'admin',
      createdtime: new Date(),
      items: {
        create: [
          { variantId: pvList[0].variantId, quantity: 1, createdby: 'admin', createdtime: new Date() },
          { variantId: pvList[1].variantId, quantity: 1, createdby: 'admin', createdtime: new Date() },
        ],
      },
    },
    include: { items: true },
  });
  const starterItems = bundleStarterData.items;

  // 2. BND_PRO: FIXED
  const bundleProData = await prisma.bundle.create({
    data: {
      code: 'BND_PRO',
      name: 'Combo chăm sóc chuyên sâu',
      description: 'Serum + Kem dưỡng + Tẩy trang',
      priceStrategy: PriceStrategy.FIXED,
      discountValue: '0.00',
      fixedPrice: '599.99',
      createdby: 'admin',
      createdtime: new Date(),
      items: {
        create: [
          { variantId: pvList[2].variantId, quantity: 1, createdby: 'admin', createdtime: new Date() },
          { variantId: pvList[3].variantId, quantity: 1, createdby: 'admin', createdtime: new Date() },
          { variantId: pvList[4].variantId, quantity: 1, createdby: 'admin', createdtime: new Date() },
        ],
      },
    },
    include: { items: true },
  });
  const proItems = bundleProData.items;

  // 3. BND_SAVE10: PERCENT
  const bundleSave10Data = await prisma.bundle.create({
    data: {
      code: 'BND_SAVE10',
      name: 'Combo tiết kiệm 10%',
      description: 'Nước hoa hồng + Son dưỡng x2 + Mặt nạ',
      priceStrategy: PriceStrategy.PERCENT,
      discountValue: '10.00',
      createdby: 'admin',
      createdtime: new Date(),
      items: {
        create: [
          { variantId: pvList[6].variantId, quantity: 1, createdby: 'admin', createdtime: new Date() },
          { variantId: pvList[8].variantId, quantity: 2, createdby: 'admin', createdtime: new Date() },
          { variantId: pvList[5].variantId, quantity: 1, createdby: 'admin', createdtime: new Date() },
        ],
      },
    },
    include: { items: true },
  });
  const save10Items = bundleSave10Data.items;

  console.log('Created 3 Bundles: BND_STARTER, BND_PRO, BND_SAVE10');

  // =============================
  // ORDER + ORDERLINE (CART) – 3 BUNDLE LINES
  // =============================
  const order = await prisma.order.create({
    data: {
      userId: customer.userId,
      status: OrderStatus.CART,
      totalAmount: '0.00',
      createdby: 'admin',
      createdtime: new Date(),
    },
  });

  // Tính giá bundle
  const sumPrice = (119.99 + 179.50).toFixed(2); // 299.49
  const percentOriginal = (99.50 + 59.90 * 2 + 159.00).toFixed(2); // 378.30
  const percentPrice = (parseFloat(percentOriginal) * 0.9).toFixed(2); // 340.47

  await prisma.orderLine.createMany({
    data: [
      // 1. Bundle SUM
      {
        orderId: order.orderId,
        bundleId: bundleStarterData.bundleId,
        quantity: 1,
        unitPrice: sumPrice,
        totalPrice: sumPrice,
        metadata: {
          bundleCode: 'BND_STARTER',
          strategy: 'SUM',
          originalPrice: sumPrice,
          items: [
            { sku: 'VAR-001', name: 'Sữa rửa mặt dịu nhẹ', qty: 1, price: '119.99' },
            { sku: 'VAR-002', name: 'Kem chống nắng SPF50+', qty: 1, price: '179.50' },
          ],
        },
        createdby: 'admin',
        createdtime: new Date(),
      },
      // 2. Bundle FIXED
      {
        orderId: order.orderId,
        bundleId: bundleProData.bundleId,
        quantity: 1,
        unitPrice: '599.99',
        totalPrice: '599.99',
        metadata: {
          bundleCode: 'BND_PRO',
          strategy: 'FIXED',
          fixedPrice: '599.99',
          items: [
            { sku: 'VAR-003', name: 'Serum Vitamin C', qty: 1, price: '249.99' },
            { sku: 'VAR-004', name: 'Kem dưỡng ẩm ban đêm', qty: 1, price: '299.99' },
            { sku: 'VAR-005', name: 'Tẩy trang dạng dầu', qty: 1, price: '89.90' },
          ],
        },
        createdby: 'admin',
        createdtime: new Date(),
      },
      // 3. Bundle PERCENT
      {
        orderId: order.orderId,
        bundleId: bundleSave10Data.bundleId,
        quantity: 1,
        unitPrice: percentPrice,
        totalPrice: percentPrice,
        metadata: {
          bundleCode: 'BND_SAVE10',
          strategy: 'PERCENT',
          discount: '10.00',
          originalPrice: percentOriginal,
          finalPrice: percentPrice,
          items: [
            { sku: 'VAR-007', name: 'Nước hoa hồng', qty: 1, price: '99.50' },
            { sku: 'VAR-009', name: 'Son dưỡng môi', qty: 2, price: '59.90' },
            { sku: 'VAR-006', name: 'Mặt nạ ngủ', qty: 1, price: '159.00' },
          ],
        },
        createdby: 'admin',
        createdtime: new Date(),
      },
    ],
  });

  // Cập nhật totalAmount
  const lines = await prisma.orderLine.findMany({ where: { orderId: order.orderId } });
  const total = lines.reduce((sum, line) => sum + parseFloat(line.totalPrice.toString()), 0);
  await prisma.order.update({
    where: { orderId: order.orderId },
    data: { totalAmount: total.toFixed(2) },
  });

  console.log(`Order #${order.orderId} created with 3 bundle lines.`);
  console.log(`Total Amount: ${total.toFixed(2)}`);

  // =============================
  // TĂNG reservedStock (khi thêm vào cart)
  // =============================
  const bundleVariantIds = [
    ...starterItems.map(item => item.variantId),
    ...proItems.map(item => item.variantId),
    ...save10Items.map(item => item.variantId),
  ];

  await prisma.productVariant.updateMany({
    where: { variantId: { in: bundleVariantIds } },
    data: { reservedStock: { increment: 1 } },
  });

  console.log('Updated reservedStock for bundle items.');

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