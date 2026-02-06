
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const htmlField = 'page_dump.html';
const imageDir = path.join('src', 'assets', 'category', 'B.B CREM PAGE');

const html = fs.readFileSync(htmlField, 'utf8');
const $ = cheerio.load(html);

const products = [];
const imageFiles = fs.readdirSync(imageDir);

$('.product').each((i, el) => {
    const titleEl = $(el).find('.product-title a');
    const name = titleEl.text().trim();

    // Price extraction: often in .price amount bdi
    const priceText = $(el).find('.price .amount bdi').first().text().replace(/[^\d.]/g, ''); // removed currency symbol
    const price = priceText ? parseFloat(priceText) : 0;

    // Match image
    // I need to generate the clean title again to match the filename
    const cleanTitle = name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.\-_]/g, '')
        .replace(/-+/g, '-');

    // Find matching file
    const imgFile = imageFiles.find(f => f.startsWith(cleanTitle));

    if (name && imgFile) {
        products.push({
            id: `omw-bb-${i}`,
            name,
            brand: "Missha", // Defaulting brand since it's not easily scraped from the summary card, or I can parse it from name
            price,
            rating: 4.5, // Default/Mock
            reviews: Math.floor(Math.random() * 100) + 10,
            imageVar: `bbCreamImg${i}`,
            imagePath: `./assets/category/B.B CREM PAGE/${imgFile}`,
            tag: i === 0 ? "Best Seller" : "",
            benefits: ["SPF 42", "PA+++"] // Mock/Generic
        });
    }
});

// Setup brands logic a bit better
products.forEach(p => {
    if (p.name.toLowerCase().includes('missha')) p.brand = "Missha";
    else if (p.name.toLowerCase().includes('poetic')) p.brand = "Poetic Blooms";
    else if (p.name.toLowerCase().includes('fresh')) p.brand = "Fresh";
    else if (p.name.toLowerCase().includes('velvet')) p.brand = "Velvet";
});

// Generate Code
let output = '// Imports\n';
products.forEach(p => {
    output += `import ${p.imageVar} from "${p.imagePath.replace(/\\/g, '/')}";\n`;
});

output += '\n// Data\n';
output += 'const BB_CREAM_DATA = [\n';
products.forEach(p => {
    output += `    {
        id: "${p.id}",
        name: "${p.name}",
        brand: "${p.brand}",
        price: ${p.price},
        rating: ${p.rating},
        reviews: ${p.reviews},
        image: ${p.imageVar},
        tag: "${p.tag}",
        benefits: ${JSON.stringify(p.benefits)}
    },\n`;
});
output += '];\n';

fs.writeFileSync('bb_data_final.js', output, 'utf8');
console.log('Wrote data to bb_data_final.js');

