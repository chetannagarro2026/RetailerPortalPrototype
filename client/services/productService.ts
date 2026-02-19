/**
 * Product Service
 * API calls related to products
 */

import { apiConfig } from "../config/apiConfig";
import { fetchAPI } from "./api";
import { ProductListResponse } from "@shared/api";

export type PriceRequestItem = {
  upc: string;
  channelCode: string;
  accoundId: string;
};

export type BestPricesResponse = {
  productPrice: Record<
    string,
    {
      upc: string;
      basePrice: string;
      listPrice: string;
      priceChange: string;
    }
  >;
};

/**
 * Fetch featured products list
 * @param page - Page number (default: 0)
 * @param size - Number of items per page (default: 8)
 */
export function fetchFeaturedProducts(
  page: number = 0,
  size: number = 8
): Promise<ProductListResponse> {
  return fetchAPI<ProductListResponse>(
    apiConfig.endpoints.productsList(page, size)
  );
}

/**
 * Fetch products for a specific category
 * @param categoryId - Category ID to fetch products for
 * @param page - Page number (default: 0)
 * @param size - Number of items per page (default: 10)
 */
export function fetchProductsByCategory(
  categoryId: string,
  page: number = 0,
  size: number = 10
): Promise<ProductListResponse> {
  return fetchAPI<ProductListResponse>(
    apiConfig.endpoints.productsByCategory(categoryId, page, size)
  );
}

/**
 * Fetch best prices for a list of products
 * @param items - Array of { upc, channelCode, accoundId }
 */
export function fetchBestPrices(items: PriceRequestItem[]): Promise<BestPricesResponse> {
  return fetchAPI<BestPricesResponse>(apiConfig.endpoints.pricesBest, {
    method: "POST",
    body: JSON.stringify(items),
  });
}
