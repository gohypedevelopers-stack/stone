import os

filepath = r"c:\Users\kshit\Desktop\code\react\stone\new\src\AdminDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Target block for existing images
old_existing_block = """                                             <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity backdrop-blur-[1px]">
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
                                               <span className="text-white text-[7px] font-black uppercase tracking-[0.2em] mt-2 bg-indigo-950/80 px-2 py-0.5 rounded-full">
                                                 Promote
                                               </span>
                                             </div>"""

new_existing_block = """                                             <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity backdrop-blur-[1px]">
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
                                                   <ChevronLeft className="h-3.5 w-3.5" />
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
                                                     <ChevronRight className="h-3.5 w-3.5" />
                                                   </button>
                                                 )}
                                               </div>
                                               <span className="text-white text-[7px] font-black uppercase tracking-[0.2em] bg-indigo-950/80 px-2 py-0.5 rounded-full">
                                                 Reorder / Promote
                                               </span>
                                             </div>"""

# Target block for additional images overlay
old_add_overlay = """                                         {/* Actions Overlay */}
                                         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">"""

new_add_overlay = """                                         {/* Actions Overlay */}
                                         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <div className="absolute top-2 left-2 bg-stone-900/90 text-white text-[8px] font-black h-5 w-5 flex items-center justify-center rounded-full border border-white/20">
                                             {idx + (newProduct.existingImages?.length || 1) + 1}
                                           </div>"""

if old_existing_block in content:
    content = content.replace(old_existing_block, new_existing_block)
    print("Updated existing images block")
else:
    print("Could not find existing images block exactly. Trying fuzzy match...")
    # Very simple fuzzy match by stripping whitespace
    import re
    # Just replace the span Promote part as it's likely the culprit
    content = re.sub(r'<span className="text-white text-\[7px\] font-black uppercase tracking-\[0.2em\] mt-2 bg-indigo-950/80 px-2 py-0.5 rounded-full">\s*Promote\s*</span>', 
                     '<span className="text-white text-[7px] font-black uppercase tracking-[0.2em] bg-indigo-950/80 px-2 py-0.5 rounded-full">Reorder / Promote</span>', content)

if old_add_overlay in content:
    content = content.replace(old_add_overlay, new_add_overlay)
    print("Updated additional images overlay")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
