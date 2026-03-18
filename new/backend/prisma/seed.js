import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const skincareCategory = await prisma.category.upsert({
    where: { slug: "serums" },
    update: {},
    create: {
      name: "Serums",
      slug: "serums",
    },
  });

  const vendor = await prisma.vendor.upsert({
    where: { email: "hello@glowhouse.com" },
    update: {},
    create: {
      businessName: "Glow House",
      storeAddress: "Connaught Place, New Delhi",
      contactNumber: "9898989898",
      email: "hello@glowhouse.com",
      businessCategory: "Beauty & Skincare",
      approvalStatus: "APPROVED",
    },
  });

  const customer = await prisma.customer.upsert({
    where: { mobile: "9876543210" },
    update: {},
    create: {
      name: "Aarav Sharma",
      mobile: "9876543210",
      email: "aarav@example.com",
      rewardPoints: 320,
    },
  });

  const address = await prisma.address.upsert({
    where: { id: "seed-home-address" },
    update: {
      customerId: customer.id,
      label: "Home",
      line1: "42 Green Park",
      city: "New Delhi",
      state: "Delhi",
      postalCode: "110016",
    },
    create: {
      id: "seed-home-address",
      customerId: customer.id,
      label: "Home",
      line1: "42 Green Park",
      city: "New Delhi",
      state: "Delhi",
      postalCode: "110016",
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: "centella-repair-serum" },
    update: {},
    create: {
      vendorId: vendor.id,
      categoryId: skincareCategory.id,
      name: "Centella Repair Serum",
      slug: "centella-repair-serum",
      brand: "Skin Relief",
      description: "Hydrating recovery serum for barrier support.",
      imageUrls: [],
      tags: ["featured", "reward-eligible", "trending"],
      price: "1299.00",
      discountPrice: "999.00",
      stock: 44,
      featured: true,
      discounted: true,
      rewardEligible: true,
    },
  });

  const campaign = await prisma.campaign.upsert({
    where: { id: "seed-weekend-rewards" },
    update: {},
    create: {
      id: "seed-weekend-rewards",
      title: "Weekend Rewards Booster",
      status: "active",
    },
  });

  await prisma.homepageBanner.upsert({
    where: { id: "seed-banner-001" },
    update: {
      title: "Spring Skin Reset",
      subtitle: "Fresh arrivals and reward-ready products",
      ctaLabel: "Shop Now",
      ctaUrl: "/shop",
      sortOrder: 1,
      campaignId: campaign.id,
      isActive: true,
    },
    create: {
      id: "seed-banner-001",
      title: "Spring Skin Reset",
      subtitle: "Fresh arrivals and reward-ready products",
      ctaLabel: "Shop Now",
      ctaUrl: "/shop",
      sortOrder: 1,
      campaignId: campaign.id,
      isActive: true,
    },
  });

  await prisma.rewardTransaction.upsert({
    where: { id: "seed-reward-earned-001" },
    update: {
      customerId: customer.id,
      type: "EARNED",
      source: "online-purchase",
      points: 20,
      note: "Seeded reward transaction",
    },
    create: {
      id: "seed-reward-earned-001",
      customerId: customer.id,
      type: "EARNED",
      source: "online-purchase",
      points: 20,
      note: "Seeded reward transaction",
    },
  });

  await prisma.order.upsert({
    where: { id: "seed-order-001" },
    update: {
      customerId: customer.id,
      vendorId: vendor.id,
      addressId: address.id,
      status: "SHIPPED",
      subtotal: "999.00",
      discountAmount: "0.00",
      totalAmount: "999.00",
      rewardPointsUsed: 0,
      rewardPointsEarned: 20,
    },
    create: {
      id: "seed-order-001",
      orderNumber: "OMW-SEED-001",
      customerId: customer.id,
      vendorId: vendor.id,
      addressId: address.id,
      status: "SHIPPED",
      subtotal: "999.00",
      discountAmount: "0.00",
      totalAmount: "999.00",
      rewardPointsUsed: 0,
      rewardPointsEarned: 20,
    },
  });

  await prisma.orderItem.upsert({
    where: { id: "seed-order-item-001" },
    update: {
      orderId: "seed-order-001",
      productId: product.id,
      name: product.name,
      quantity: 1,
      unitPrice: "999.00",
      lineTotal: "999.00",
    },
    create: {
      id: "seed-order-item-001",
      orderId: "seed-order-001",
      productId: product.id,
      name: product.name,
      quantity: 1,
      unitPrice: "999.00",
      lineTotal: "999.00",
    },
  });

  await prisma.orderTracking.upsert({
    where: { id: "seed-order-track-001" },
    update: {
      orderId: "seed-order-001",
      status: "SHIPPED",
      note: "Seeded tracking event",
    },
    create: {
      id: "seed-order-track-001",
      orderId: "seed-order-001",
      status: "SHIPPED",
      note: "Seeded tracking event",
    },
  });

  await prisma.offlinePurchase.upsert({
    where: { id: "seed-offline-001" },
    update: {
      customerId: customer.id,
      vendorId: vendor.id,
      mobile: customer.mobile,
      amount: "999.00",
      linkedAt: new Date(),
    },
    create: {
      id: "seed-offline-001",
      customerId: customer.id,
      vendorId: vendor.id,
      mobile: customer.mobile,
      amount: "999.00",
      linkedAt: new Date(),
    },
  });

  await prisma.offlinePurchaseItem.upsert({
    where: { id: "seed-offline-item-001" },
    update: {
      offlinePurchaseId: "seed-offline-001",
      name: product.name,
      quantity: 1,
      unitPrice: "999.00",
    },
    create: {
      id: "seed-offline-item-001",
      offlinePurchaseId: "seed-offline-001",
      name: product.name,
      quantity: 1,
      unitPrice: "999.00",
    },
  });

  await prisma.notification.upsert({
    where: { id: "seed-notification-001" },
    update: {
      audience: "CUSTOMER",
      channel: "SMS",
      customerId: customer.id,
      vendorId: vendor.id,
      title: "Order shipped",
      message: "Your seeded order has been shipped.",
    },
    create: {
      id: "seed-notification-001",
      audience: "CUSTOMER",
      channel: "SMS",
      customerId: customer.id,
      vendorId: vendor.id,
      title: "Order shipped",
      message: "Your seeded order has been shipped.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
