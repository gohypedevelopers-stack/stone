import prisma from "./src/lib/prisma.js";

async function cleanup() {
  console.log("Starting consolidation of duplicate products...");
  
  try {
    // 1. Find groups of products with the same name and brand
    const groups = await prisma.product.groupBy({
      by: ['name', 'brand'],
      _count: { _all: true },
      having: { name: { _count: { gt: 1 } } }
    });

    console.log(`Found ${groups.length} groups of duplicate products.`);

    for (const group of groups) {
      if (!group.name) continue;
      
      const products = await prisma.product.findMany({
        where: { 
          name: group.name,
          brand: group.brand,
          status: { not: 'ARCHIVED' }
        },
        orderBy: { createdAt: 'asc' } // Oldest first
      });

      if (products.length <= 1) {
        console.log(`Group "${group.name}" logic skip: only ${products.length} active products left.`);
        continue;
      }

      const master = products[0];
      const dupes = products.slice(1);

      console.log(`Merging ${dupes.length} duplicates into master: "${master.name}" (${master.id})`);

      for (const dupe of dupes) {
        // Move VendorStock
        const dupeStocks = await prisma.vendorStock.findMany({
          where: { productId: dupe.id }
        });

        for (const ds of dupeStocks) {
          // Try to upsert into master
          await prisma.vendorStock.upsert({
            where: {
              productId_vendorId: {
                productId: master.id,
                vendorId: ds.vendorId
              }
            },
            update: {
              quantity: { increment: ds.quantity }
            },
            create: {
              productId: master.id,
              vendorId: ds.vendorId,
              quantity: ds.quantity
            }
          });
        }

        // Move OrderItems
        await prisma.orderItem.updateMany({
          where: { productId: dupe.id },
          data: { productId: master.id }
        });

        // Move OfflinePurchaseItems
        await prisma.offlinePurchaseItem.updateMany({
          where: { productId: dupe.id },
          data: { productId: master.id }
        });

        // Mark as ARCHIVED
        await prisma.product.update({
          where: { id: dupe.id },
          data: { status: 'ARCHIVED' }
        });
      }
    }
    
    console.log("Cleanup complete!");
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    process.exit(0);
  }
}

cleanup();
