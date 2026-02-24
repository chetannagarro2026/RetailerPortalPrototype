/**
 * API Configuration
 * Centralized configuration for all API endpoints and base URLs
 */

// Internal API base URL
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL || ""
    : "/api";

// Azure APIM base configuration
const AZURE_APIM_BASE = import.meta.env.VITE_AZURE_APIM_BASE_URL || "https://ndoms-dev-apim.azure-api.net";

// Image base URL (Azure Blob Storage)
const IMAGE_BASE_URL = import.meta.env.VITE_PIM_IMAGE_BASE_URL || "https://ndomsdevstorageacc.blob.core.windows.net";

// External API base URLs (Azure APIM + path)
const EXTERNAL_API_BASE = `${AZURE_APIM_BASE}${import.meta.env.VITE_PIM_API_PATH || "/pim/dev/v1/api"}`;
const EXTERNAL_PRICE_BASE = `${AZURE_APIM_BASE}${import.meta.env.VITE_PRICE_API_PATH || "/price-management/dev/api/v1"}`;
const EXTERNAL_PO_BASE = `${AZURE_APIM_BASE}${import.meta.env.VITE_PO_API_PATH || "/purchase-order/dev/api/v1"}`;
const EXTERNAL_CONFIG_BASE = `${AZURE_APIM_BASE}${import.meta.env.VITE_CONFIG_API_PATH || "/configuration/dev/api/v1"}`;
const EXTERNAL_SALES_ORDER_BASE = `${AZURE_APIM_BASE}${import.meta.env.VITE_SALES_ORDER_API_PATH || "/salesorder/dev/api/v1"}`;

export const apiConfig = {
  base: BASE_URL,
  externalBase: EXTERNAL_API_BASE,
  imageBase: IMAGE_BASE_URL,

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

    // Products by category
    productsByCategory: (categoryId: string, page = 0, size = 10) =>
      `${EXTERNAL_API_BASE}/products/listByCategoryId/${categoryId}?page=${page}&size=${size}`,

    // Purchase Orders
    poSearch: `${EXTERNAL_PO_BASE}/purchase-order/search`,

    // Business Accounts (Configuration API)
    businessAccountsByIdList: (ids: string) => 
      `${EXTERNAL_CONFIG_BASE}/configuration/business-accounts/byIdList?ids=${ids}`,

    // Sales Order
    salesOrderCreate: `${EXTERNAL_SALES_ORDER_BASE}/sales-order/`,
    salesOrderSearch: `${EXTERNAL_SALES_ORDER_BASE}/sales-order/search/`,

    // Product by UPC
    productByUpc: (upcId: string) => `${EXTERNAL_API_BASE}/products/upc/${upcId}`,

    // Add your API endpoints below
    // products: `${BASE_URL}/products`,
    // orders: `${BASE_URL}/orders`,
    // users: `${BASE_URL}/users`,
  },
} as const;
