import comingSoonG from "../assets/COMINGSOON/G.jpg";
import comingSoonH from "../assets/COMINGSOON/H.jpg";
import comingSoonI from "../assets/COMINGSOON/I.jpg";
import comingSoonJ from "../assets/COMINGSOON/J.jpg";

export const SERVER_URL = import.meta.env.VITE_APP_API_URL || "https://stone-backend.vercel.app";

const LEGACY_COMING_SOON_IMAGES = {
    "G.jpg": comingSoonG,
    "H.jpg": comingSoonH,
    "I.jpg": comingSoonI,
    "J.jpg": comingSoonJ,
};

/**
 * Robust image resolution helper.
 * Handles absolute URLs, Vite static assets, and backend-hosted uploads.
 * @param {string|null} img - The image path or URL.
 * @returns {string|null} - The resolved absolute URL.
 */
export const resolveImage = (img) => {
    if (!img) return null;
    const normalized = String(img).trim();
    const legacyComingSoonMatch = normalized.match(/(?:^|\/)COMINGSOON\/([^/?#]+)$/i);

    if (legacyComingSoonMatch) {
        return LEGACY_COMING_SOON_IMAGES[legacyComingSoonMatch[1]] || null;
    }
    
    // 1. Handle absolute URLs (Cloudinary, Unsplash, etc.)
    // If it's already a full URL pointing to our backend (old domain or localhost), normalize it
    if (
        normalized.includes("localhost:5000") ||
        normalized.includes("stone-backend.vercel.app")
    ) {
        return normalized.replace(/^https?:\/\/(localhost:5000|stone-backend\.vercel\.app)/i, SERVER_URL);
    }

    if (normalized.startsWith("http") || normalized.startsWith("data:") || normalized.startsWith("blob:")) {
        return normalized;
    }

    if (normalized.startsWith("/app/")) {
        return `${SERVER_URL}/uploads/${normalized.split("/").pop()}`;
    }
    
    // 2. Handle Backend Uploads (Dynamic Products)
    // Most products from AdminDashboard start with /uploads or uploads/
    if (normalized.includes("/uploads") || normalized.startsWith("uploads/")) {
        const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
        return `${SERVER_URL}${path}`;
    }
    
    // 3. Handle Vite Assets (Static Products)
    // If it's a relative path that doesn't look like an upload, 
    // it's likely a local Vite asset from productData.js
    return normalized;
};
