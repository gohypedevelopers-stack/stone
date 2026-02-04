export const PRODUCTS = [
    {
        id: "p1",
        name: "Hydra Barrier Serum",
        brand: "COSRX",
        price: 899,
        tag: "Best Seller",
        rating: 4.8,
        reviews: 1240,
        category: "Skincare",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        ingredients: "Snail Mucin, Hyaluronic Acid",
        size: "100ml",
        shades: []
    },
    {
        id: "p2",
        name: "Daily UV Gel SPF 50",
        brand: "Biore",
        price: 699,
        tag: "Top Rated",
        rating: 4.9,
        reviews: 890,
        category: "Sun Care",
        image: "https://images.unsplash.com/photo-1556228720-1987599988d3?auto=format&fit=crop&w=800&q=80",
        ingredients: "Water, Ethylhexyl Methoxycinnamate",
        size: "50g",
        shades: []
    },
    {
        id: "p3",
        name: "Rice Glow Essence",
        brand: "I'm From",
        price: 999,
        tag: "Trending",
        rating: 4.7,
        reviews: 560,
        category: "Skincare",
        image: "https://images.unsplash.com/photo-1571781535092-132d8c97356c?auto=format&fit=crop&w=800&q=80",
        ingredients: "Rice Extract, Niacinamide",
        size: "150ml",
        shades: []
    },
    {
        id: "p4",
        name: "Silk Hair Repair Oil",
        brand: "Mise En Scene",
        price: 1299,
        tag: "Best Seller",
        rating: 4.8,
        reviews: 2100,
        category: "Haircare",
        image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80",
        ingredients: "Argan Oil, Royal Jelly",
        size: "80ml",
        shades: []
    },
    {
        id: "p5",
        name: "Crystal Flora Perfume",
        brand: "Tamburins",
        price: 3499,
        tag: "New",
        rating: 4.6,
        reviews: 45,
        category: "Fragrance",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
        ingredients: "Rose, Bergamot, Musk",
        size: "50ml",
        shades: []
    },
    {
        id: "p6",
        name: "Velvet Lip Tint",
        brand: "Rom&nd",
        price: 899,
        tag: "Everyday",
        rating: 4.7,
        reviews: 3200,
        category: "Makeup",
        image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80",
        ingredients: "Dimethicone, Polyglyceryl-2",
        size: "5.5g",
        shades: ["#06 Figfig", "#07 Jujube", "#13 Eat Dotori"]
    },
    {
        id: "p7",
        name: "Rose Quartz Face Roller",
        brand: "Mount Lai",
        price: 1599,
        tag: "Tool",
        rating: 4.5,
        reviews: 150,
        category: "Tools",
        image: "https://images.unsplash.com/photo-1600858963579-450f6d7a42b8?auto=format&fit=crop&w=800&q=80",
        ingredients: "Rose Quartz",
        size: "Standard",
        shades: []
    },
    {
        id: "p8",
        name: "Cica Sleeping Mask",
        brand: "Laneige",
        price: 1850,
        tag: "Vegan",
        rating: 4.9,
        reviews: 5000,
        category: "Skincare",
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
        ingredients: "Forest Yeast, Cica",
        size: "60ml",
        shades: []
    }
];

export function getAllProducts() {
    return PRODUCTS;
}
