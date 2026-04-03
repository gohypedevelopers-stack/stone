import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: 'beauty product', mode: 'insensitive' } }
  });
  
  if (product) {
    console.log('Found product:', product.name, 'ID:', product.id);
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: { specialOfferType: 'Deal 1' }
    });
    console.log('Updated specialOfferType to Deal 1');
  } else {
    console.log('Product "beauty product" not found');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
