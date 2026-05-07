import os

filepath = r"c:\Users\kshit\Desktop\code\react\stone\new\src\AdminDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Match the additional images overlay div
    if 'group-hover:opacity-100 transition-opacity' in line and 'Actions Overlay' in lines[lines.index(line)-1]:
        indent = line[:line.find('<')]
        new_lines.append(line)
        new_lines.append(f'{indent}  <div className="absolute top-2 left-2 bg-stone-900/90 text-white text-[8px] font-black h-5 w-5 flex items-center justify-center rounded-full border border-white/20">\n')
        new_lines.append(f'{indent}    {{idx + (newProduct.existingImages?.length || 1) + 1}}\n')
        new_lines.append(f'{indent}  </div>\n')
    # Match the existing images overlay div
    elif 'backdrop-blur-[1px]' in line:
        indent = line[:line.find('<')]
        new_lines.append(line)
        new_lines.append(f'{indent}  <div className="absolute top-2 left-2 bg-stone-900/90 text-white text-[8px] font-black h-5 w-5 flex items-center justify-center rounded-full border border-white/20">\n')
        new_lines.append(f'{indent}    {{idx + 2}}\n')
        new_lines.append(f'{indent}  </div>\n')
    else:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
