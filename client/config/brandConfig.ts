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

  // Navigation items (configurable per tenant)
  navItems: Array<{
    key: string;
    label: string;
    path: string;
    hasMegaMenu?: boolean;
  }>;
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

  navItems: [
    { key: "home", label: "Home", path: "/" },
    { key: "collections", label: "Collections", path: "/collections", hasMegaMenu: true },
    { key: "brands", label: "Brands", path: "/brands", hasMegaMenu: true },
    { key: "purchase-orders", label: "Purchase Orders", path: "/purchase-orders" },
    { key: "financials", label: "Financials", path: "/financials" },
    { key: "statements", label: "Statements", path: "/statements" },
    { key: "support", label: "Support", path: "/support" },
  ],
};

// Active configuration — swap this import to change tenants
export const activeBrandConfig = centricBrandsConfig;
