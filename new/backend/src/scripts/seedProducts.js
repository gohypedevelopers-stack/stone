import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

const generateSlug = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
        + '-' + Math.random().toString(36).substring(2, 6);
};

async function main() {
    const dataPath = path.resolve(__dirname, '../../../src/productData.js');
    console.log("Reading data from:", dataPath);
    const content = fs.readFileSync(dataPath, 'utf8');

    // 1. Parse imports
    const importRegex = /import\s+([a-zA-Z0-9_]+)\s+from\s+["'](\.\/assets\/[^"']+)["']/g;
    const imageMap = {};
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        imageMap[match[1]] = match[2]; 
    }
    console.log(`Found ${Object.keys(imageMap).length} image imports.`);

    // 2. Extract payload
    const dataStart = content.indexOf('export const CATEGORY_DATA_GENERATED = {');
    if (dataStart === -1) {
        console.error("Could not find CATEGORY_DATA_GENERATED start");
        return;
    }
    let dataText = content.substring(dataStart + 'export const CATEGORY_DATA_GENERATED = '.length);
    
    // Evaluate object
    const evalScript = `
        ${Object.keys(imageMap).map(key => `const ${key} = "${imageMap[key]}";`).join('\n')}
        return ${dataText.replace(/;\s*$/, '')};
    `;
    const data = new Function(evalScript)();

    // 3. Prepare upload directory
    const uploadsDir = path.resolve(__dirname, '../../../backend/public/uploads/products');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 4. Create default vendor
    let vendor = await prisma.vendor.findFirst({ where: { businessName: 'Admin Stock' } });
    if (!vendor) {
        // Migration: check for old name
        const oldVendor = await prisma.vendor.findFirst({ where: { businessName: 'OMW Global' } });
        if (oldVendor) {
            vendor = await prisma.vendor.update({
                where: { id: oldVendor.id },
                data: { businessName: 'Admin Stock', email: 'admin-stock@omw.com' }
            });
            console.log("Renamed OMW Global to Admin Stock");
        } else {
            vendor = await prisma.vendor.create({
                data: {
                    businessName: 'Admin Stock',
                    ownerName: 'Admin',
                    contactNumber: '0000000000',
                    email: 'admin-stock@omw.com',
                    businessCategory: 'General',
                    storeAddress: 'OMW Headquarters',
                    approvalStatus: 'APPROVED'
                }
            });
            console.log("Created vendor Admin Stock");
        }
    }

    // 5. Seed categories and products
    let addedCount = 0;
    for (const [catName, products] of Object.entries(data)) {
        let category = await prisma.category.findUnique({ where: { name: catName } });
        if (!category) {
            category = await prisma.category.create({ 
                data: { name: catName, slug: generateSlug(catName) } 
            });
            console.log("Created category:", catName);
        }

        for (const prod of products) {
            // prod.image contains relative path from src/productData.js like "./assets/category/B.B CREM PAGE/..."
            const sourceImagePath = path.resolve(__dirname, '../../../src', prod.image);
            const filename = path.basename(prod.image);
            const destImagePath = path.join(uploadsDir, filename);

            if (fs.existsSync(sourceImagePath)) {
                fs.copyFileSync(sourceImagePath, destImagePath);
            } else {
                console.warn("Could not find source image:", sourceImagePath);
            }

            const baseUrl = process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? "https://stone-backend.vercel.app" : "http://localhost:5000");
            const imageUrl = `${baseUrl}/uploads/products/${encodeURIComponent(filename)}`;

            const existingProd = await prisma.product.findFirst({ where: { name: prod.name } });
            if (!existingProd) {
                await prisma.product.create({
                    data: {
                        name: prod.name,
                        slug: generateSlug(prod.name),
                        brand: prod.brand || 'OMW Skincare',
                        description: prod.benefits?.join(', ') || '',
                        price: parseFloat(prod.price) || 0,
                        stock: 100, // Add some stock
                        categoryId: category.id,
                        vendorId: vendor.id,
                        imageUrls: [imageUrl]
                    }
                });
                addedCount++;
            }
        }
    }
    console.log(`Successfully seeded ${addedCount} products!`);
}

main()
    .catch(e => {
        fs.writeFileSync('seedProducts_error.txt', e.stack || e.message || String(e), 'utf8');
        console.error("Seeding Error:");
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
