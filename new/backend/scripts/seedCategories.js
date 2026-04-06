import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const CATEGORIES = [
  "B.b cream", "Blender", "Blush", "Brush", "Cleanser", "cleansing oil",
  "compact powders", "Concealer", "Cushion foundation", "Essence",
  "Exfoliate", "Eye cream", "Face mists", "Foundation", "Hair set",
  "International makeup", "International skincare", "Japanese Skincare",
  "Korean skincare", "Lip blam", "Lipstick", "Makeup remover",
  "Mascara", "Moisturizer", "Primer", "Razor", "Serums", "Sheet masks",
  "SKIN1004", "Sunscreen", "Sunspray", "Sunstick", "toner", "toner pads",
  "Treatment mask"
];

const generateSlug = (text) => {
  return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
};

async function main() {
  console.log("Seeding categories...");
  for (const name of CATEGORIES) {
    const slug = generateSlug(name) + '-' + Math.random().toString(36).substring(2, 6);
    try {
      await prisma.category.upsert({
        where: { name: name },
        update: {},
        create: {
          name: name,
          slug: slug
        }
      });
      console.log(`Created/Verified category: ${name}`);
    } catch (e) {
      console.error(`Error creating category ${name}:`, e.message);
    }
  }
  console.log("Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
