import os
import re

filepath = r"c:\Users\kshit\Desktop\code\react\stone\new\src\AdminDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the Star button block and the Reorder span in existing images gallery
# We'll use a regex that matches the button with Star inside and the span
pattern_existing = r'(<button\s+type="button"\s+onClick=\{\(e\) => \{.*?newExist\.unshift\(imageToPromote\);.*?Set as Primary"\s+>\s+<Star.*?/button>)'
content = re.sub(pattern_existing, '', content, flags=re.DOTALL)

# Remove the text span
pattern_text = r'<span className="text-white text-\[7px\] font-black uppercase tracking-\[0.2em\] bg-indigo-950/80 px-2 py-0.5 rounded-full">Reorder / Promote</span>'
content = re.sub(pattern_text, '', content)

# Also check for the star in additional images part if it was added
pattern_additional_star = r'<Star className="h-4 w-4 text-amber-500 fill-amber-500" />'
# Replace it with ChevronLeft if it was the first item's move-left button
content = content.replace(pattern_additional_star, '<ChevronLeft className="h-4 w-4" />')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned up gallery overlay")
