/**
 * Site Configuration - Fallback Defaults
 * 
 * These values are used as fallbacks when the database config is unavailable.
 * The actual site configuration is managed in the admin panel (Site Config section)
 * and stored in the site_config database table.
 * 
 * IMPORTANT: After deploying, update these values in the Admin Panel → Site Config
 * to customize your brand without code changes.
 */

export const siteConfig = {
  // Brand - Update these in Admin Panel → Site Config
  name: "Greet",
  tagline: "Your AI website assistant, always online",
  logoUrl: "",
  logoUrlDark: "",
  description: "Engage every visitor. Answer every question. Book every appointment. AI chat assistant trained on your website, ready in minutes.",
  
  // Contact - Update in Admin Panel → Site Config
  supportEmail: "hello@greet.chat",
  salesEmail: "hello@greet.chat",
  
  // Social links - Leave empty to hide, configure in Admin Panel
  social: {
    twitter: "",
    linkedin: "",
    instagram: "",
  },
  
  // Legal pages
  privacyUrl: "/privacy",
  termsUrl: "/terms",
  
  // Features
  trialDays: 14,
  annualDiscount: 20, // percentage
  
  // Default currency
  currency: "EUR",
  currencySymbol: "€",
  
  // Social proof (set to empty string to hide)
  socialProof: {
    customerCount: "500+",
    customerLabel: "businesses worldwide",
  },
  
  // Demo page
  demo: {
    enabled: true,
    title: "Try the AI Assistant",
    subtitle: "Chat with our AI and see how it works in real time",
  },
} as const;

export type SiteConfig = typeof siteConfig;