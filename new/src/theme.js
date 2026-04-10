/**
 * OMW Marketplace - Core Design Tokens & Theme File
 * 
 * This file extracts all repeating design decisions used across the frontend
 * (Homepage, Admin Dashboard, Watch And Shop, etc). It can be used to 
 * maintain UI consistency without memorizing arbitrary tailwind strings or Hex codes.
 */

export const THEME = {
  colors: {
    // Primary Foundation
    background: {
      primary: "bg-white",
      secondary: "bg-stone-50",
      accentDark: "bg-gradient-to-b from-[#1a0b2e] to-[#0b0314]",
      accentSolid: "bg-gradient-to-br from-[#251042] via-[#1a0b2e] to-[#0b0314]"
    },

    // Core Text
    text: {
      primary: "text-stone-900",
      secondary: "text-stone-400",
      muted: "text-stone-300",
      inverse: "text-white"
    },

    // State Colors
    status: {
      success: "emerald-500",
      danger: "rose-500",
      info: "blue-500",
      warning: "orange-500",
      brandHighlight: "pink-600"
    },

    // Specific Hex Codes (Found manually in project files)
    raw: {
      brandPurple: "#9a6bff",
      brandDark: "#151515"
    }
  },

  gradients: {
    brand: "bg-gradient-to-r from-[#ff4fa3] via-[#6f5cff] to-[#ff8a2a]",
    brandSolid: "bg-[#ff4fa3]",
    videoOverlay: "bg-gradient-to-b from-black/10 via-transparent to-black/60",
    heroOverlay: "bg-gradient-to-t from-black/80 via-black/20 to-transparent",
    brandHover: "hover:bg-gradient-to-r hover:from-[#ff4fa3] hover:to-[#6f5cff]"
  },

  typography: {
    // Core font weights used
    weights: {
      heavy: "font-black",       // Used for main headers
      bold: "font-extrabold",    // Used for subheaders
      medium: "font-bold",       // Used for body copy / inputs
      normal: "font-medium"      // Used for muted descriptions
    },

    // Standardized Headline Formats
    headings: {
      h1: "text-[32px] font-black tracking-tighter leading-none", // 32px Page Titles
      h2: "text-2xl font-extrabold tracking-wide",          // 24px Section Headers
      h3: "text-lg font-bold tracking-tight",                   // 18px Card Titles
    },

    // Standardized Micro-copy (Those super tiny capitalized subtitles)
    micro: {
      default: "text-sm font-black uppercase tracking-widest leading-none", // 14px
      muted: "text-xs font-bold uppercase tracking-[0.2em] text-stone-400"  // 12px
    }
  },

  borders: {
    // Rounding used universally across dashboard and storefront
    radius: {
      sm: "rounded-lg",
      md: "rounded-xl",
      lg: "rounded-[1.25rem]",
      xl: "rounded-[1.5rem]",
      pill: "rounded-full"
    },

    // Standard Line strokes
    stroke: {
      default: "border border-stone-100",
      input: "border border-stone-200",
      hover: "hover:border-stone-300"
    }
  },

  shadows: {
    // Elevational Dropshadows built in Tailwind for floating cards
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-[0_18px_40px_rgba(0,0,0,0.12)]",        // Floating Hero
    xl: "shadow-2xl shadow-stone-900/10",               // Extreme elevation
    button: "shadow-[0_2px_6px_rgba(0,0,0,0.25)]",      // Pagination Dots
    video: "shadow-[0_20px_40px_rgba(0,0,0,0.15)]"      // Watch And Shop card active
  },

  animations: {
    // Custom tailwind keyframe extensions you use
    marquee: "animate-smooth-marquee",
    heroSlide: "animate-[heroSlide_18s_ease-in-out_infinite]",
    dotPulse: "animate-[heroDot_18s_infinite]",
    transitions: "transition-all duration-500 ease-out"
  }
};

/**
 * Usage Example in a JSX File:
 * 
 * import { THEME } from "./theme.js";
 * 
 * export function MyComponent() {
 *   return (
 *     <div className={`${THEME.colors.background.secondary} ${THEME.borders.radius.lg} p-8`}>
 *       <h2 className={`${THEME.typography.headings.h2} ${THEME.colors.text.primary}`}>
 *          My New Section
 *       </h2>
 *       <p className={`${THEME.typography.micro.muted} mt-2`}>
 *          Subtext
 *       </p>
 *     </div>
 *   )
 * }
 */
