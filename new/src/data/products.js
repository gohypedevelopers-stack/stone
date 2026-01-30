export const PRODUCTS = [
    { id: "p1", name: "Hydra Barrier Serum", price: 899, tag: "Best Seller", rating: 4.7, origin: "Korean", reviews: 124, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80" },
    { id: "p2", name: "Daily UV Gel SPF 50", price: 699, tag: "Top Rated", rating: 4.8, origin: "Japanese", reviews: 89, image: "https://images.unsplash.com/photo-1556228720-1987599988d3?auto=format&fit=crop&w=800&q=80" },
    { id: "p3", name: "Rice Glow Essence", price: 999, tag: "New", rating: 4.6, origin: "Korean", reviews: 56, image: "https://images.unsplash.com/photo-1571781535092-132d8c97356c?auto=format&fit=crop&w=800&q=80" },
    { id: "p4", name: "Calm Clean Foam", price: 499, tag: "Value", rating: 4.5, origin: "Japanese", reviews: 210, image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80" },
    { id: "p5", name: "Vitamin C Booster", price: 1099, tag: "Brightening", rating: 4.6, origin: "Other", reviews: 45, image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80" },
    { id: "p6", name: "Tinted Lip Balm", price: 399, tag: "Everyday", rating: 4.4, origin: "Korean", reviews: 320, image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80" },
];

export function getAllProducts() {
    return PRODUCTS;
}
