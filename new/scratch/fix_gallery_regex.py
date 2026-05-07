import os
import re

filepath = r"c:\Users\kshit\Desktop\code\react\stone\new\src\AdminDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for the existing images div content
pattern = r'(<div className="absolute inset-0 bg-\[#1a0b2e\]/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity backdrop-blur-\[1px\]">)(.*?)(\s+<span className="text-white text-\[7px\] font-black uppercase tracking-\[0.2em\] bg-indigo-950/80 px-2 py-0.5 rounded-full">Reorder / Promote</span>)'

replacement = r'''\1
                                               <div className="absolute top-2 left-2 bg-stone-900/90 text-white text-[8px] font-black h-5 w-5 flex items-center justify-center rounded-full border border-white/20">
                                                 {idx + 2}
                                               </div>
                                               <div className="flex items-center gap-2 mb-2">
                                                 <button
                                                   type="button"
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                     const newExist = [...newProduct.existingImages];
                                                     const currentPos = idx + 1;
                                                     [newExist[currentPos], newExist[currentPos - 1]] = [newExist[currentPos - 1], newExist[currentPos]];
                                                     setNewProduct({ ...newProduct, existingImages: newExist });
                                                   }}
                                                   className="h-7 w-7 bg-white text-stone-900 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all"
                                                 >
                                                   <ChevronLeft className="h-4 w-4" />
                                                 </button>
                                                 <button
                                                   type="button"
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                     const newExist = [...newProduct.existingImages];
                                                     const imageToPromote = newExist[idx + 1];
                                                     newExist.splice(idx + 1, 1);
                                                     newExist.unshift(imageToPromote);
                                                     setNewProduct({ ...newProduct, existingImages: newExist });
                                                   }}
                                                   className="h-9 w-9 bg-white text-amber-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-amber-100"
                                                   title="Set as Primary"
                                                 >
                                                   <Star className="h-5 w-5 fill-amber-500" />
                                                 </button>
                                                 {idx < (newProduct.existingImages?.length || 0) - 2 && (
                                                   <button
                                                     type="button"
                                                     onClick={(e) => {
                                                       e.stopPropagation();
                                                       const newExist = [...newProduct.existingImages];
                                                       const currentPos = idx + 1;
                                                       [newExist[currentPos], newExist[currentPos + 1]] = [newExist[currentPos + 1], newExist[currentPos]];
                                                       setNewProduct({ ...newProduct, existingImages: newExist });
                                                     }}
                                                     className="h-7 w-7 bg-white text-stone-900 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all"
                                                   >
                                                     <ChevronRight className="h-4 w-4" />
                                                   </button>
                                                 )}
                                               </div>\3'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

if new_content != content:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated the gallery logic")
else:
    print("Pattern match failed")
