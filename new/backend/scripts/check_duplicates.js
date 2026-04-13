import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  const products = await prisma.product.findMany({
    select: { name: true, id: true, category: { select: { name: true } } }
  });
  console.log('Total products:', count);
  console.log('Products:', JSON.stringify(products, null, 2));

  // Check for exact name duplicates
  const names = products.map(p => p.name);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  console.log('Duplicate names found:', Array.from(new Set(duplicates)));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
