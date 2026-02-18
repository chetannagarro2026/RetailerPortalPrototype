/**
 * API Configuration
 * Centralized configuration for all API endpoints and base URLs
 */

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.VITE_API_BASE_URL || ""
    : "/api";

const EXTERNAL_API_BASE = "https://ndoms-dev-apim.azure-api.net/pim/dev/v1/api";
const EXTERNAL_PRICE_BASE = "https://ndoms-dev-apim.azure-api.net/price-management/dev/api/v1";
const EXTERNAL_PO_BASE = "https://ndoms-dev-apim.azure-api.net/purchase-order/dev/api/v1";

export const apiConfig = {
  base: BASE_URL,
  externalBase: EXTERNAL_API_BASE,

  // Endpoint paths
  endpoints: {
    // Example endpoints
    demo: `${BASE_URL}/demo`,
    ping: `${BASE_URL}/ping`,

    // External API endpoints
    productsList: (page = 0, size = 10) =>
      `${EXTERNAL_API_BASE}/products/list?page=${page}&size=${size}`,

    // Price management
    pricesBest: `${EXTERNAL_PRICE_BASE}/prices/best`,

    // Categories (tree by parent)
    categoriesTreeByParent: (parentId: string) => `${EXTERNAL_API_BASE}/categories/treeByParent/${parentId}`,

    // Purchase Orders
    poSearch: `${EXTERNAL_PO_BASE}/purchase-order/search`,

    // Add your API endpoints below
    // products: `${BASE_URL}/products`,
    // orders: `${BASE_URL}/orders`,
    // users: `${BASE_URL}/users`,
  },
} as const;
