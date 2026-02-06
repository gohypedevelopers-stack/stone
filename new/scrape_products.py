import urllib.request
import re
import json
import ssl
import time
import sys

# Ignore SSL errors
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_page(url):
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        )
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        sys.stderr.write(f"Error fetching {url}: {e}\n")
        return ""

def get_product_urls(category_url):
    html = fetch_page(category_url)
    # Find all links containing /product/ that are NOT category links
    # simple quotes match
    links = re.findall(r'href="(https://www.omwskincare.com/product/[^/]+/?)"', html)
    # Filter out non-product links if likely
    product_links = list(set([l for l in links if 'add-to-cart' not in l]))
    return product_links

def parse_product_page(url):
    html = fetch_page(url)
    if not html: return None
    
    product = {"link": url}
    
    # 1. Name - usually h1 entry-title
    name_match = re.search(r'<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>(.*?)</h1>', html)
    if not name_match:
        # Fallback to OG title
        name_match = re.search(r'<meta property="og:title" content="([^"]+)"', html)
        
    if name_match:
        # Cleanup HTML entities if any
        product['name'] = name_match.group(1).replace('&#8211;', '-').strip()
    else:
        product['name'] = "Unknown Product"

    # 2. Image - OG Image is best
    img_match = re.search(r'<meta property="og:image" content="([^"]+)"', html)
    if img_match:
        product['image'] = img_match.group(1)
    else:
        # Fallback to first text match of wp-content upload
        img_match = re.search(r'(https://www.omwskincare.com/wp-content/uploads/[^"]+\.jpg)', html)
        product['image'] = img_match.group(1) if img_match else ""

    # 3. Price - <p class="price"> or <span class="price">
    # Look for the digits text
    # The site uses "₨" symbol (U+20A8)
    price_match = re.search(r'(?:₨|Rs\.)\s*([\d,]+(?:\.\d{2})?)', html)
    if price_match:
        product['price'] = int(float(price_match.group(1).replace(',', '')))
    else:
        product['price'] = 0
        
    return product

base_url = "https://www.omwskincare.com/product-category/foundation/"
product_urls_1 = get_product_urls(base_url)
product_urls_2 = get_product_urls(base_url + "page/2/")

all_urls = list(set(product_urls_1 + product_urls_2))

sys.stderr.write(f"Found {len(all_urls)} product URLs. Scraping details...\n")

final_products = []
for i, url in enumerate(all_urls):
    p = parse_product_page(url)
    if p and p['price'] > 0: # Ensure valid price
        # Add ID for React
        p['id'] = f"omw-found-{i+1}"
        p['brand'] = "OMW Skincare" # Generic if brand not found
        p['rating'] = 4.5 # Mock
        p['reviews'] = 100 # Mock
        p['tag'] = "Featured" if i < 3 else ""
        p['benefits'] = ["Long Wear", "Full Coverage"]
        final_products.append(p)
    # be polite to server
    # time.sleep(0.5)

print(json.dumps(final_products, indent=2))
