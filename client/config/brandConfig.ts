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

  // Search
  searchPlaceholder: string;

  // Catalog display
  categoryCardVariant: CategoryCardVariant;
  productCardVariant: ProductCardVariant;

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

  searchPlaceholder: "Search by Style Code, Collection, Brand...",

  categoryCardVariant: "hero",
  productCardVariant: "standard",

  navItems: [
    { key: "collections", label: "Collections", path: "/collections", hasMegaMenu: true },
    { key: "brands", label: "Brands", path: "/brands" },
    { key: "purchase-orders", label: "Purchase Orders", path: "/purchase-orders" },
    { key: "bulk-order", label: "Bulk Order", path: "/bulk-order" },
    { key: "my-account", label: "My Account", path: "/account", hasDropdown: true },
  ],
};

// Active configuration — swap this import to change tenants
export const activeBrandConfig = centricBrandsConfig;
