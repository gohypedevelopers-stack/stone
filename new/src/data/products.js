export const PRODUCTS = [
    { id: "p1", name: "Hydra Barrier Serum", price: 899, tag: "Best Seller", rating: 4.7, origin: "Korean" },
    { id: "p2", name: "Daily UV Gel SPF 50", price: 699, tag: "Top Rated", rating: 4.8, origin: "Japanese" },
    { id: "p3", name: "Rice Glow Essence", price: 999, tag: "New", rating: 4.6, origin: "Korean" },
    { id: "p4", name: "Calm Clean Foam", price: 499, tag: "Value", rating: 4.5, origin: "Japanese" },
    { id: "p5", name: "Vitamin C Booster", price: 1099, tag: "Brightening", rating: 4.6, origin: "Other" },
    { id: "p6", name: "Tinted Lip Balm", price: 399, tag: "Everyday", rating: 4.4, origin: "Korean" },
];

export function getAllProducts() {
    return PRODUCTS;
}
