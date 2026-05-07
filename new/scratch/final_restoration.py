import os

filepath = r"c:\Users\kshit\Desktop\code\react\stone\new\src\AdminDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Marker 1: Start of Right Column / Product Media
start_marker = 'Product Media'
# Marker 2: Start of Pricing Matrix
end_marker = 'Pricing Matrix'

# Find the start of the card containing Product Media
start_pos = content.find(start_marker)
if start_pos != -1:
    # Backtrack to the start of the div
    # Look for the last 'bg-white rounded-[5px] border border-stone-200' before this
    start_pos = content.rfind('<div className="bg-white rounded-[5px] border border-stone-200 shadow-sm p-6', 0, start_pos)

# Find the start of the card containing Pricing Matrix
end_pos = content.find(end_marker)
if end_pos != -1:
    # Look for the last '<div' before this which is mangled
    # Actually, look for the 'Financial configuration' which is unique
    end_pos = content.find('Financial configuration', end_pos)
    # Then look for the next '</div>' that closes this card part
    # No, better to just find the marker for the NEXT section or where I want to start my clean code
    # I want to replace everything from start_pos to just before 'Pricing Matrix' card content
    pricing_start = content.rfind('<div', 0, content.find(end_marker))
    # Wait, the card is mangled at line 6555: '>'
    end_pos = content.find('>', content.rfind('Pricing Matrix', 0, content.find('Pricing Matrix') + 100)) # This is confusing

# Let's use simpler logic: Replace everything between 
# '<div className="bg-white rounded-[5px] border border-stone-200 shadow-sm p-6' (Product Media)
# and
# '<div className="flex items-center gap-5 border-b border-stone-100 pb-8">' (Pricing Matrix header)

start_search = '<div className="bg-white rounded-[5px] border border-stone-200 shadow-sm p-6'
end_search = '<div className="flex items-center gap-5 border-b border-stone-100 pb-8">'

start_pos = content.find(start_search)
end_pos = content.find(end_search)

if start_pos == -1 or end_pos == -1:
    print(f"Markers not found: start={start_pos}, end={end_pos}")
    exit(1)

print(f"Replacing from {start_pos} to {end_pos}")

# The new content for Product Media card AND the opening of Pricing Matrix card
new_content = r'''<div className="bg-white rounded-[5px] border border-stone-200 shadow-sm p-6 space-y-6 transition-all hover:shadow-md">
                                <div className="flex items-center gap-4 border-b border-stone-100 pb-5">
                                  <div className="h-12 w-12 rounded-[10px] bg-[#fff1f2] flex items-center justify-center shadow-sm">
                                    <ImageIcon className="h-6 w-6 text-[#e11d48]" />
                                  </div>
                                  <div>
                                    <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#1a1a1a]">
                                      Product Media
                                    </h2>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1.5">
                                      Visual assets & gallery
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <Label
                                    className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] ml-1"
                                  >
                                    Primary Image{" "}
                                    <span className="text-rose-500">*</span>
                                  </Label>
                                  <div
                                    onClick={() =>
                                      document
                                        .getElementById("primaryImageFP")
                                        .click()
                                    }
                                    className="relative h-48 rounded-[5px] border border-stone-200 bg-white flex flex-col items-center justify-center cursor-pointer group hover:border-[#6366f1] transition-all overflow-hidden shadow-sm"
                                  >

                                  {imageFiles.primary ? (
                                    <>
                                      <img
                                        src={URL.createObjectURL(
                                          imageFiles.primary,
                                        )}
                                        className="h-full w-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex flex-col gap-3 items-center justify-center transition-opacity">
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-stone-900/80 px-3 py-1 rounded-[5px]">
                                          Primary Image
                                        </span>
                                        {imageFiles.additional.length > 0 && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const firstAdditional = imageFiles.additional[0];
                                              const remainingAdditional = imageFiles.additional.slice(1);
                                              setImageFiles({
                                                primary: firstAdditional,
                                                additional: [imageFiles.primary, ...remainingAdditional]
                                              });
                                            }}
                                            className="px-4 py-2 bg-white text-stone-900 text-[9px] font-black uppercase tracking-widest rounded-[5px] hover:bg-indigo-50 transition-all flex items-center gap-2"
                                          >
                                            <ArrowUpDown className="h-3 w-3" /> Swap with Next
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  ) : newProduct.existingImages &&
                                    newProduct.existingImages.length > 0 ? (
                                    <>
                                      <img
                                        src={getMediaUrl(
                                          newProduct.existingImages[0],
                                        )}
                                        className="h-full w-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex flex-col gap-3 items-center justify-center transition-opacity">
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-stone-900/80 px-3 py-1 rounded-[5px]">
                                          Existing Primary
                                        </span>
                                        {(newProduct.existingImages.length > 1 || imageFiles.additional.length > 0) && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (newProduct.existingImages.length > 1) {
                                                const newExisting = [...newProduct.existingImages];
                                                [newExisting[0], newExisting[1]] = [newExisting[1], newExisting[0]];
                                                setNewProduct({ ...newProduct, existingImages: newExisting });
                                              } else {
                                                const firstAdd = imageFiles.additional[0];
                                                const remAdd = imageFiles.additional.slice(1);
                                                const currentPrim = newProduct.existingImages[0];
                                                setImageFiles({ primary: firstAdd, additional: remAdd });
                                                setNewProduct({ ...newProduct, existingImages: [currentPrim, ...newProduct.existingImages.slice(1)] });
                                              }
                                            }}
                                            className="px-4 py-2 bg-white text-stone-900 text-[9px] font-black uppercase tracking-widest rounded-[5px] hover:bg-indigo-50 transition-all flex items-center gap-2"
                                          >
                                            <ArrowUpDown className="h-3 w-3" /> Swap with Next
                                          </button>
                                        )}
                                        <span className="text-white/60 text-[8px] font-bold uppercase tracking-tighter">
                                          Click to Overwrite
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <Camera className="h-8 w-8 text-stone-300 mb-3 group-hover:text-emerald-500 group-hover:scale-110 transition-all" />
                                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                                        Upload Image
                                      </p>
                                      <p className="text-[8px] text-stone-300 mt-1 font-medium">
                                        Click to browse
                                      </p>
                                    </>
                                  )}
                                  <input
                                    id="primaryImageFP"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) =>
                                      setImageFiles({
                                        ...imageFiles,
                                        primary: e.target.files[0],
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                <div
                                  className="flex items-center gap-3 p-4 bg-stone-50 rounded-[5px] border border-stone-100 cursor-pointer"
                                  onClick={() =>
                                    setHasMultipleImages(!hasMultipleImages)
                                  }
                                >
                                  <div
                                    className={cn(
                                      "h-5 w-5 border-2 flex items-center justify-center transition-all",
                                      THEME.borders.radius.sm,
                                      hasMultipleImages ||
                                        (newProduct.existingImages &&
                                          newProduct.existingImages.length > 1)
                                        ? "bg-[#151515] border-[#151515]"
                                        : "bg-white border-stone-200"
                                    )}
                                  >
                                    {(hasMultipleImages ||
                                      (newProduct.existingImages &&
                                        newProduct.existingImages.length > 1)) && (
                                      <Check className="h-3 w-3 text-white stroke-[4px]" />
                                    )}
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">
                                    Include Multiple Images
                                  </span>
                                </div>

                                {(hasMultipleImages ||
                                  (newProduct.existingImages &&
                                    newProduct.existingImages.length > 1)) && (
                                  <div className="grid grid-cols-3 gap-3">
                                    {/* Display existing supplementary images */}
                                    {newProduct.existingImages &&
                                      newProduct.existingImages
                                        .slice(1)
                                        .map((url, idx) => (
                                          <div
                                            key={`exist-${idx}`}
                                            className="aspect-square rounded-[5px] overflow-hidden relative group border border-stone-100 hover:border-indigo-400 transition-all"
                                          >
                                            <img
                                              src={getMediaUrl(url)}
                                              className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-[#1a0b2e]/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity backdrop-blur-[1px]">
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
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    {imageFiles.additional.map((file, idx) => (
                                      <div
                                        key={idx}
                                        className="aspect-square rounded-[5px] overflow-hidden relative group border border-stone-100"
                                      >
                                        <img
                                          src={URL.createObjectURL(file)}
                                          className="h-full w-full object-cover"
                                        />
                                        
                                        {/* Actions Overlay */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="absolute top-2 left-2 bg-stone-900/90 text-white text-[8px] font-black h-5 w-5 flex items-center justify-center rounded-full border border-white/20">
                                            {idx + (newProduct.existingImages?.length || 1) + 1}
                                          </div>
                                          {/* Move Left */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (idx === 0) {
                                                const currentPrimary = imageFiles.primary;
                                                const currentThis = imageFiles.additional[idx];
                                                const others = [...imageFiles.additional];
                                                others[idx] = currentPrimary;
                                                setImageFiles({ primary: currentThis, additional: others });
                                              } else {
                                                const f = [...imageFiles.additional];
                                                [f[idx], f[idx - 1]] = [f[idx - 1], f[idx]];
                                                setImageFiles({ ...imageFiles, additional: f });
                                              }
                                            }}
                                            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 text-stone-900 rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all z-10"
                                          >
                                            <ChevronLeft className="h-4 w-4" />
                                          </button>

                                          {/* Move Right */}
                                          {idx < imageFiles.additional.length - 1 && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const f = [...imageFiles.additional];
                                                [f[idx], f[idx + 1]] = [f[idx + 1], f[idx]];
                                                setImageFiles({ ...imageFiles, additional: f });
                                              }}
                                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 text-stone-900 rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all z-10"
                                            >
                                              <ChevronRight className="h-4 w-4" />
                                            </button>
                                          )}

                                          {/* Delete Overlay */}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const f = [...imageFiles.additional];
                                              f.splice(idx, 1);
                                              setImageFiles({ ...imageFiles, additional: f });
                                            }}
                                            className="absolute inset-0 bg-rose-500/40 flex items-center justify-center backdrop-blur-[2px]"
                                          >
                                            <div className="h-8 w-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                              <Trash2 className="h-4 w-4" />
                                            </div>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    {imageFiles.additional.length +
                                      (newProduct.existingImages
                                        ? newProduct.existingImages.slice(1)
                                            .length
                                        : 0) <
                                      9 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          document
                                            .getElementById(
                                              "additionalImagesFP",
                                            )
                                            .click()
                                        }
                                        className={`aspect-square ${THEME.borders.radius.md} border-2 border-dashed border-stone-100 bg-stone-50/50 flex flex-col items-center justify-center hover:bg-white hover:border-emerald-500/30 transition-all group`}
                                      >
                                        <Plus className="h-5 w-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                                      </button>
                                    )}
                                    <input
                                      id="additionalImagesFP"
                                      type="file"
                                      multiple
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const files = Array.from(
                                          e.target.files,
                                        );
                                        setImageFiles({
                                          ...imageFiles,
                                          additional: [
                                            ...imageFiles.additional,
                                            ...files,
                                          ],
                                        });
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div
                                className="bg-white rounded-[5px] border border-stone-200 shadow-sm p-10 space-y-10 transition-all hover:shadow-md"
                              >
                              '''

final_content = content[:start_pos] + new_content + content[end_pos:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("Final restoration complete")
