export interface NavItem {
  key: string;
  label: string;
  path: string;
  hasMegaMenu?: boolean;
  hasDropdown?: boolean;
}

export type CategoryCardVariant = "hero" | "thumbnail";
export type ProductCardVariant = "compact" | "standard" | "detailed";

export interface BrandConfig {
  // Identity
  brandName: string;
  portalTitle: string;
  logoUrl?: string;

  // Example logged-in user context
  partnerName: string;

  // Colors
  primaryColor: string;
  secondaryColor: string;
  headerBg: string;
  navActiveBorder: string;
  cardBg: string;
  borderColor: string;

  // Typography
  fontFamily: string;

  // Currency
  currencySymbol: string;
  currencyPosition: 'before' | 'after'; // e.g., '$100' or '100₹'
  currencyCode: string; // e.g., 'USD', 'INR'

  // Search
  searchPlaceholder: string;

  // Catalog display
  categoryCardVariant: CategoryCardVariant;
  productCardVariant: ProductCardVariant;

  // Ordering modes
  enableMatrixOnPDP: boolean;
  enableQuickMatrixInGrid: boolean;
  enableSpreadsheetMode: boolean;
  quickMatrixVariantLimit: number;

  // Navigation items (configurable per tenant)
  navItems: NavItem[];
}

export const centricBrandsConfig: BrandConfig = {
  brandName: "Centric Brands",
  portalTitle: "Wholesale Portal",
  logoUrl: undefined,
  partnerName: "Macy's Buying Team",

  primaryColor: "#1B2A4A",
  secondaryColor: "#6B7B99",
  headerBg: "#FFFFFF",
  navActiveBorder: "#1B2A4A",
  cardBg: "#FAFAFA",
  borderColor: "#F0F0F0",

  fontFamily: "'Inter', sans-serif",

  currencySymbol: "₹",
  currencyPosition: "before",
  currencyCode: "INR",

  searchPlaceholder: "Search by Style Code, Collection, Brand...",

  categoryCardVariant: "hero",
  productCardVariant: "standard",

  enableMatrixOnPDP: true,
  enableQuickMatrixInGrid: true,
  enableSpreadsheetMode: true,
  quickMatrixVariantLimit: 12,

  navItems: [
    { key: "collections", label: "Catalog", path: "/collections", hasMegaMenu: true },
    { key: "purchase-orders", label: "Purchase Orders", path: "/purchase-orders" },
    { key: "bulk-order", label: "Bulk Order", path: "/bulk-order" },
    { key: "my-account", label: "My Account", path: "/account", hasDropdown: true },
  ],
};


export const jnjVisionConfig: BrandConfig = {
  brandName: "Johnson & Johnson Vision",
  portalTitle: "Wholesale Portal",
  logoUrl: undefined,
  partnerName: "Macy's Buying Team",

  primaryColor: "#1B2A4A",
  secondaryColor: "#6B7B99",
  headerBg: "#FFFFFF",
  navActiveBorder: "#1B2A4A",
  cardBg: "#FAFAFA",
  borderColor: "#F0F0F0",

  fontFamily: "'Inter', sans-serif",

  currencySymbol: "₹",
  currencyPosition: "before",
  currencyCode: "INR",

  searchPlaceholder: "Search by Category, Product name, Brand...",

  categoryCardVariant: "hero",
  productCardVariant: "standard",

  enableMatrixOnPDP: true,
  enableQuickMatrixInGrid: true,
  enableSpreadsheetMode: true,
  quickMatrixVariantLimit: 12,

  navItems: [
    { key: "collections", label: "Catalog", path: "/collections", hasMegaMenu: true },
    { key: "purchase-orders", label: "Purchase Orders", path: "/purchase-orders" },
    { key: "bulk-order", label: "Bulk Order", path: "/bulk-order" },
    { key: "my-account", label: "My Account", path: "/account", hasDropdown: true },
  ],
};
// Active configuration — swap this import to change tenants
export const activeBrandConfig = jnjVisionConfig;

// ═══════════════════════════════════════════════════════════════════
// CURRENCY FORMATTING UTILITY
// ═══════════════════════════════════════════════════════════════════

/**
 * Format a price value according to the active brand configuration
 * @param price - The numeric price value
 * @param config - Optional brand config (defaults to activeBrandConfig)
 * @returns Formatted price string
 */
export function formatPrice(price: number, config: BrandConfig = activeBrandConfig): string {
  const formatted = price.toFixed(2);
  return config.currencyPosition === 'before'
    ? `${config.currencySymbol}${formatted}`
    : `${formatted}${config.currencySymbol}`;
}

/**
 * Format a currency value with locale formatting (thousands separators)
 * @param value - The numeric value
 * @param decimals - Number of decimal places (default: 2)
 * @param config - Optional brand config (defaults to activeBrandConfig)
 * @returns Formatted currency string with thousands separators
 */
export function formatCurrency(value: number, decimals: number = 2, config: BrandConfig = activeBrandConfig): string {
  const formatted = value.toLocaleString("en-US", { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return config.currencyPosition === 'before'
    ? `${config.currencySymbol}${formatted}`
    : `${formatted}${config.currencySymbol}`;
}
