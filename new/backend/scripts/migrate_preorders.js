import "dotenv/config";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

const baseUrl = process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? "https://stone-backend.vercel.app" : "http://localhost:5000");

const PREORDER_PRODUCTS = [
    {
        id: "po1",
        name: "Luminous Silk Foundation",
        tag: "Exclusive",
        image: `${baseUrl}/assets/COMINGSOON/G.jpg`,
        unlockDate: "10 Mar, 10:00 AM",
        stockLeft: 42,
        totalStock: 100,
        price: 2499,
        mrp: 3200,
        rating: 4.8,
        reviews: 124,
        description: "Experience the weightless, silky texture that glides onto your skin, providing a luminous, natural glow. Formulated with hydrating silk proteins for all-day moisture.",
        releaseDate: "10 Mar 2026",
        shippingStart: "12 Mar 2026",
        ingredients: "Water, Silk Protein, Hyaluronic Acid, Niacinamide...",
        usage: "Apply a small amount to the center of the face and blend outwards.",
    },
    {
        id: "po2",
        name: "Velvet Blur Lip Tint",
        tag: "Exclusive",
        image: `${baseUrl}/assets/COMINGSOON/H.jpg`,
        unlockDate: "15 Mar, 12:00 PM",
        stockLeft: 12,
        totalStock: 50,
        price: 1299,
        mrp: 1600,
        rating: 4.7,
        reviews: 89,
        description: "A soft-focus lip tint that blurs fine lines and delivers a velvet-matte finish. Long-wearing and comfortable.",
        releaseDate: "15 Mar 2026",
        shippingStart: "18 Mar 2026",
        ingredients: "Dimethicone, Vinyl Dimethicone Cross-polymer, Water...",
        usage: "Apply directly to lips for a bold look, or dab with fingers for a blotted effect.",
    },
    {
        id: "po3",
        name: "Crystal Glow Serum",
        tag: "Exclusive",
        image: `${baseUrl}/assets/COMINGSOON/I.jpg`,
        unlockDate: "20 Mar, 09:00 AM",
        stockLeft: 85,
        totalStock: 200,
        price: 1899,
        mrp: 2400,
        rating: 4.9,
        reviews: 210,
        description: "Achieve glass skin with this crystal-infused serum. Brightens, hydrates, and refines texture.",
        releaseDate: "20 Mar 2026",
        shippingStart: "22 Mar 2026",
        ingredients: "Water, Niacinamide, Crystal Extract, Glycerin...",
        usage: "Apply 2-3 drops to clean skin morning and night.",
    },
    {
        id: "po4",
        name: "Moonlight Night Cream",
        tag: "Exclusive",
        image: `${baseUrl}/assets/COMINGSOON/J.jpg`,
        unlockDate: "25 Mar, 08:00 PM",
        stockLeft: 20,
        totalStock: 60,
        price: 1599,
        mrp: 2100,
        rating: 4.6,
        reviews: 55,
        description: "Repair and rejuvenate your skin overnight with this rich, nourishing cream. Wake up to a plump, glowing complexion.",
        releaseDate: "25 Mar 2026",
        shippingStart: "27 Mar 2026",
        ingredients: "Water, Shea Butter, Ceramides, Peptides...",
        usage: "Apply as the last step of your night routine.",
    },
    {
        id: "po5",
        name: "Rose Quartz Roller",
        tag: "Exclusive",
        image: `${baseUrl}/assets/COMINGSOON/G.jpg`, 
        unlockDate: "28 Mar, 10:00 AM",
        stockLeft: 5,
        totalStock: 30,
        price: 1999,
        mrp: 2800,
        rating: 4.5,
        reviews: 30,
        description: "De-puff and sculpt with this authentic rose quartz roller. Promotes lymphatic drainage and enhances product absorption.",
        releaseDate: "28 Mar 2026",
        shippingStart: "30 Mar 2026",
        ingredients: "100% Authentic Rose Quartz Stone...",
        usage: "Roll upwards and outwards on clean skin, preferably with a serum or oil.",
    }
];

async function migrate() {
  try {
    const section = await prisma.homepageSection.findUnique({
      where: { componentId: "pre-order" },
    });

    if (!section) {
      console.error("Pre-order section not found in database.");
      return;
    }

    const currentSettings = section.settings || {};
    const updatedSettings = {
      ...currentSettings,
      preorderProducts: PREORDER_PRODUCTS,
    };

    await prisma.homepageSection.update({
      where: { id: section.id },
      data: { settings: updatedSettings },
    });

    console.log("Pre-order products migrated successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
