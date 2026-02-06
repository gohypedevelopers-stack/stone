import axios from 'axios';
import fs from 'fs';

const url = 'https://www.omwskincare.com/product-category/b-b-cream/';

async function fetchHTML() {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        fs.writeFileSync('page_dump.html', data);
        console.log('HTML saved to page_dump.html');
    } catch (error) {
        console.error('Error fetching HTML:', error.message);
    }
}

fetchHTML();
