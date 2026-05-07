export const CATEGORY_GROUPS = {
  skincare: [
    "cleanser", "cleansing oil", "essence", "exfoliate", "eye cream", 
    "face mists", "international skincare", "japanese skincare", 
    "korean skincare", "moisturizer", "serums", "sheet masks", 
    "skin1004", "sunscreen", "sunspray", "sunstick", "toner", 
    "toner pads", "treatment mask", "skincare", "skin"
  ],
  makeup: [
    "b.b cream", "blender", "blush", "brush", "compact powders", 
    "concealer", "cushion foundation", "foundation", "international makeup", 
    "lip blam", "lipstick", "makeup remover", "mascara", "primer", "makeup"
  ],
  haircare: [
    "hair set", "haircare", "shampoo", "conditioner", "hair"
  ],
  tools: [
    "razor", "blender", "brush", "tools", "tool", "applicator"
  ],
  fragrance: [
    "perfume", "fragrance", "mist", "scent"
  ]
};

export const isInCategoryGroup = (productCategory, groupName) => {
  if (!productCategory || !groupName) return false;
  
  const pCat = productCategory.toLowerCase();
  const group = groupName.toLowerCase();
  
  if (pCat === group) return true;
  
  const mappedCategories = CATEGORY_GROUPS[group];
  if (mappedCategories) {
    return mappedCategories.some(cat => pCat.includes(cat) || cat.includes(pCat));
  }
  
  return false;
};
