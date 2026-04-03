export const SERVER_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

/**
 * Robust image resolution helper.
 * Handles absolute URLs, Vite static assets, and backend-hosted uploads.
 * @param {string|null} img - The image path or URL.
 * @returns {string|null} - The resolved absolute URL.
 */
export const resolveImage = (img) => {
    if (!img) return null;
    
    // 1. Handle absolute URLs (Cloudinary, Unsplash, etc.)
    if (img.startsWith("http") || img.startsWith("data:") || img.startsWith("blob:")) {
        return img;
    }
    
    // 2. Handle Backend Uploads (Dynamic Products)
    // Most products from AdminDashboard start with /uploads or uploads/
    if (img.includes("/uploads") || img.startsWith("uploads/")) {
        const path = img.startsWith("/") ? img : `/${img}`;
        return `${SERVER_URL}${path}`;
    }
    
    // 3. Handle Vite Assets (Static Products)
    // If it's a relative path that doesn't look like an upload, 
    // it's likely a local Vite asset from productData.js
    return img;
};
