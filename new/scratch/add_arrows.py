import os

filepath = r"c:\Users\kshit\Desktop\code\react\stone\new\src\AdminDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Target part: the existing images button part
old_part = """                                               <button
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
                                               </button>"""

new_part = """                                               <div className="flex items-center gap-2 mb-2">
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
                                               </div>"""

if old_part in content:
    content = content.replace(old_part, new_part)
    print("Updated existing images move logic")
else:
    print("Could not find part exactly")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
