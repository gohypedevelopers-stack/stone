
import { PrismaClient } from '../node_modules/@prisma/client/index.js';
const prisma = new PrismaClient();

async function main() {
  const sections = await prisma.homepageSection.findMany();
  console.log(JSON.stringify(sections, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
