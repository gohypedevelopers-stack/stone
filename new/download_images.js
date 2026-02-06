
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);

const TARGET_URL = 'https://www.omwskincare.com/product-category/treatment-mask/';
const TARGET_DIR = path.join('src', 'assets', 'category', 'Treatment mask');

async function downloadImage(url, filepath) {
    try {
        const response = await axios.get(url, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        await streamPipeline(response.data, fs.createWriteStream(filepath));
        console.log(`Downloaded: ${filepath}`);
    } catch (error) {
        console.error(`Failed to download ${url}: ${error.message}`);
    }
}

async function main() {
    try {
        // Ensure target directory exists
        if (!fs.existsSync(TARGET_DIR)) {
            fs.mkdirSync(TARGET_DIR, { recursive: true });
            console.log(`Created directory: ${TARGET_DIR}`);
        }

        // Fetch page content
        const { data } = await axios.get(TARGET_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const products = $('.product');

        console.log(`Found ${products.length} products.`);

        for (let i = 0; i < products.length; i++) {
            const el = products[i];
            const titleEl = $(el).find('.product-title a');
            let rawTitle = titleEl.text().trim();

            if (!rawTitle) {
                console.warn('Skipping product with no title');
                continue;
            }

            // Clean title: replace spaces with hyphens, remove special characters that are bad for filenames
            // Keeping it simple: alphanumeric, hyphens, spaces first
            // User requested: "NAME THE DOWNLOADED IMAGE WITH ITS product heading" and "Rename the image exactly as the product name (replace spaces with hyphens)"

            const cleanTitle = rawTitle
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/[^a-zA-Z0-9.\-_]/g, '') // Remove invalid chars (sanitize)
                .replace(/-+/g, '-'); // Remove duplicate hyphens

            const imgEl = $(el).find('.product-image img');
            if (imgEl.length === 0) {
                console.warn(`No image found for ${rawTitle}`);
                continue;
            }

            // Try to get high-res from srcset
            const srcset = imgEl.attr('srcset');
            let imgUrl = imgEl.attr('src');

            if (srcset) {
                const sources = srcset.split(',').map(s => s.trim().split(/\s+/));
                // Assuming the last one is the largest, or sort by width if available
                // standard format: url width-descriptor
                // e.g. "image-300.jpg 300w, image-1000.jpg 1000w"
                // We want the one with highest width.

                let maxW = 0;

                for (const src of sources) {
                    if (src.length >= 2) {
                        const widthStr = src[src.length - 1];
                        if (widthStr.endsWith('w')) {
                            const w = parseInt(widthStr.slice(0, -1));
                            if (w > maxW) {
                                maxW = w;
                                imgUrl = src[0]; // The URL is the first part
                            }
                        }
                    }
                }
            }

            if (!imgUrl) {
                console.warn(`No image URL found for ${rawTitle}`);
                continue;
            }

            const ext = path.extname(imgUrl.split('?')[0]) || '.jpg';
            const filename = `${cleanTitle}${ext}`;
            const filepath = path.join(TARGET_DIR, filename);

            console.log(`Processing: ${rawTitle} -> ${filename}`);
            await downloadImage(imgUrl, filepath);
        }

        console.log('Done.');

    } catch (error) {
        console.error('Error in main process:', error);
    }
}

main();
