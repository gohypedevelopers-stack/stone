import prisma from './src/lib/prisma.js';
import { serializePrisma } from './src/utils/data.js';

async function main() {
  try {
    const customerId = "cmnh1vfqj00003gm9scr848ti";
    const now = new Date();
    
    console.log("Testing query with customerId:", customerId);
    
    const include = {};
    if (customerId) {
      include.claims = {
        where: { customerId }
      };
    }

    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        endsAt: { gt: now },
      },
      include,
      orderBy: { createdAt: "desc" },
    });

    console.log("Successfully fetched offers:", offers.length);
    console.log("Serialized offers:", JSON.stringify(serializePrisma(offers), null, 2));
  } catch (error) {
    console.error("Query failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
