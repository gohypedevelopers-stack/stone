import prisma from "./src/lib/prisma.js";

async function check() {
  try {
    const products = await prisma.product.findMany({
      where: { name: { contains: 'medicube', mode: 'insensitive' } },
      include: { stockRecords: true }
    });
    console.log("PRODUCTS FOUND:", JSON.stringify(products, null, 2));
    
    const stocks = await prisma.vendorStock.findMany({
      include: { product: true, vendor: true }
    });
    console.log("ALL VENDOR STOCKS:", JSON.stringify(stocks, null, 2));
  } catch (err) {
    console.error("DEBUG ERROR:", err);
  } finally {
     process.exit(0);
  }
}

check();
