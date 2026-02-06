import codecs
try:
    # Try reading as utf-16 (PowerShell default)
    with codecs.open('products.json', 'r', 'utf-16') as f:
        content = f.read()
except Exception as e:
    print(f"UTF-16 failed: {e}")
    # Fallback to utf-8
    with codecs.open('products.json', 'r', 'utf-8') as f:
        content = f.read()

with codecs.open('products_fixed.json', 'w', 'utf-8') as f:
    f.write(content)
print("Conversion successful.")
