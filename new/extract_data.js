
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// USER PROVIDED MAPPING
const CATEGORIES = [
    { url: 'https://www.omwskincare.com/product-category/b-b-cream/', dir: 'src/assets/category/B.B CREM PAGE', name: 'B.b cream' },
    { url: 'https://www.omwskincare.com/product-category/blender/', dir: 'src/assets/category/blender', name: 'Blender' },
    { url: 'https://www.omwskincare.com/product-category/blush/', dir: 'src/assets/category/blush', name: 'Blush' },
    { url: 'https://www.omwskincare.com/product-category/brush/', dir: 'src/assets/category/brush', name: 'Brush' },
    { url: 'https://www.omwskincare.com/product-category/cleanser/', dir: 'src/assets/category/cleanser', name: 'Cleanser' },
    { url: 'https://www.omwskincare.com/product-category/cleansing-oil/', dir: 'src/assets/category/cleanser oil', name: 'cleansing oil' }, // Note: User mapped 'cleansing-oil' to 'cleanser oil' dir
    { url: 'https://www.omwskincare.com/product-category/compact-powders/', dir: 'src/assets/category/compact powders', name: 'compact powders' },
    { url: 'https://www.omwskincare.com/product-category/concealer/', dir: 'src/assets/category/Concealer', name: 'Concealer' },
    { url: 'https://www.omwskincare.com/product-category/cushion-foundation/', dir: 'src/assets/category/Cushion foundation', name: 'Cushion foundation' },
    { url: 'https://www.omwskincare.com/product-category/essence/', dir: 'src/assets/category/Essence', name: 'Essence' },
    { url: 'https://www.omwskincare.com/product-category/exfoliate/', dir: 'src/assets/category/Exfoliate', name: 'Exfoliate' },
    { url: 'https://www.omwskincare.com/product-category/eye-cream/', dir: 'src/assets/category/Eye cream', name: 'Eye cream' },
    { url: 'https://www.omwskincare.com/product-category/face-mists/', dir: 'src/assets/category/Face mists', name: 'Face mists' },
    { url: 'https://www.omwskincare.com/product-category/hair-set/', dir: 'src/assets/category/Hair set', name: 'Hair set' },
    { url: 'https://www.omwskincare.com/product-category/international-makeup/', dir: 'src/assets/category/International makeup', name: 'International makeup' },
    { url: 'https://www.omwskincare.com/product-category/international-skincare/', dir: 'src/assets/category/International skincare', name: 'International skincare' },
    { url: 'https://www.omwskincare.com/product-category/japanese-skincare/', dir: 'src/assets/category/Japanese Skincare', name: 'Japanese Skincare' },
    { url: 'https://www.omwskincare.com/product-category/korean-skincare/', dir: 'src/assets/category/Korean skincare', name: 'Korean skincare' },
    { url: 'https://www.omwskincare.com/product-category/lip-blam/', dir: 'src/assets/category/Lip blam', name: 'Lip blam' },
    { url: 'https://www.omwskincare.com/product-category/lipstick/', dir: 'src/assets/category/Lipstick', name: 'Lipstick' },
    { url: 'https://www.omwskincare.com/product-category/makeup-remover/', dir: 'src/assets/category/Makeup remover', name: 'Makeup remover' },
    { url: 'https://www.omwskincare.com/product-category/mascara/', dir: 'src/assets/category/mascara', name: 'Mascara' },
    { url: 'https://www.omwskincare.com/product-category/moisturizer/', dir: 'src/assets/category/Moisturizer', name: 'Moisturizer' },
    { url: 'https://www.omwskincare.com/product-category/primer/', dir: 'src/assets/category/Primer', name: 'Primer' },
    { url: 'https://www.omwskincare.com/product-category/razor/', dir: 'src/assets/category/Razor', name: 'Razor' },
    { url: 'https://www.omwskincare.com/product-category/serums/', dir: 'src/assets/category/Serums', name: 'Serums' },
    { url: 'https://www.omwskincare.com/product-category/sheet-masks/', dir: 'src/assets/category/Sheet masks', name: 'Sheet masks' },
    { url: 'https://www.omwskincare.com/product-category/skin1004/', dir: 'src/assets/category/SKIN1004', name: 'SKIN1004' },
    { url: 'https://www.omwskincare.com/product-category/sunscreen/', dir: 'src/assets/category/Sunscreen', name: 'Sunscreen' },
    { url: 'https://www.omwskincare.com/product-category/sunspray/', dir: 'src/assets/category/Sunspray', name: 'Sunspray' },
    { url: 'https://www.omwskincare.com/product-category/sunstick/', dir: 'src/assets/category/Sunstick', name: 'Sunstick' },
    { url: 'https://www.omwskincare.com/product-category/toner/', dir: 'src/assets/category/toner', name: 'toner' },
    { url: 'https://www.omwskincare.com/product-category/toner-pads/', dir: 'src/assets/category/toner pads', name: 'toner pads' },
    { url: 'https://www.omwskincare.com/product-category/treatment-mask/', dir: 'src/assets/category/Treatment mask', name: 'Treatment mask' }
];

async function extractData() {
    let allImports = '';
    let dataObjectEntries = '';

    for (const cat of CATEGORIES) {
        console.log(`Processing ${cat.name}...`);

        try {
            // 1. Fetch HTML
            const { data } = await axios.get(cat.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...' }
            });
            const $ = cheerio.load(data);
            const products = $('.product');

            // 2. Read Local Files
            const localDir = path.join(process.cwd(), cat.dir);
            if (!fs.existsSync(localDir)) {
                console.warn(`Directory not found: ${localDir}, skipping category.`);
                continue;
            }
            const localFiles = fs.readdirSync(localDir);

            // 3. Match
            const categoryProducts = [];

            products.each((i, el) => {
                const title = $(el).find('.product-title a').text().trim();
                const priceText = $(el).find('.price').text().trim().replace(/[^0-9.]/g, ''); // Extract digits
                const price = priceText ? parseFloat(priceText) : 0;

                // Construct expected filename (same logic as download script)
                const cleanTitle = title
                    .replace(/\s+/g, '-')
                    .replace(/[^a-zA-Z0-9.\-_]/g, '')
                    .replace(/-+/g, '-');

                // Find matching file
                const match = localFiles.find(f => f.startsWith(cleanTitle));

                if (match && title) {
                    categoryProducts.push({
                        name: title,
                        price: price,
                        filename: match, // Use actual filename from disk
                        id: `prod-${cat.name.replace(/\s/g, '')}-${i}`
                    });
                }
            });

            // 4. Generate Code
            if (categoryProducts.length > 0) {
                // Generate Imports
                categoryProducts.forEach((p, i) => {
                    const varName = `img_${cat.name.replace(/[^a-zA-Z0-9]/g, '')}_${i}`;
                    // Path relative to CategoryPage.jsx (which is in src/)
                    // cat.dir is "src/assets/...", so we need "./assets/..."
                    const relativePath = `./${cat.dir.replace('src/', '')}/${p.filename}`.replace(/\\/g, '/');
                    allImports += `import ${varName} from "${relativePath}";\n`;
                    p.importVar = varName;
                    p.brand = "Brand"; // Placeholder or extract if possible?
                });

                // Generate Data Entry
                dataObjectEntries += `
        "${cat.name}": [
            ${categoryProducts.map(p => `{
                id: "${p.id}",
                name: "${p.name.replace(/"/g, '\\"')}",
                brand: "OMW Skincare", // Default brand
                price: ${p.price > 0 ? p.price : 1500},
                rating: 4.5,
                reviews: 100,
                image: ${p.importVar},
                tag: "",
                benefits: ["Hydrating", "Glow"]
            }`).join(',\n            ')}
        ],\n`;
            } else {
                console.warn(`No matching products found for ${cat.name}`);
                // Should we fake it? No, user said "skip that product entirely"
            }

        } catch (err) {
            console.error(`Error processing ${cat.name}: ${err.message}`);
        }
    }

    // Output Result to file
    const finalCode = `
// --- GENERATED IMPORTS ---
${allImports}

// --- GENERATED DATA ---
export const CATEGORY_DATA_GENERATED = {
${dataObjectEntries}
};
`;
    fs.writeFileSync('generated_data.js', finalCode);
    console.log('Success! Data generated in generated_data.js');
}

extractData();
