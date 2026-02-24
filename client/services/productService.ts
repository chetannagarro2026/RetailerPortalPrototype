/**
 * Product Service
 * API calls related to products
 */

import { apiConfig } from "../config/apiConfig";
import { fetchAPI } from "./api";
import { ProductListResponse } from "@shared/api";

// ── Product by UPC Response Types ───────────────────────────────────

export interface ProductAsset {
  assetType: string;
  fileName: string;
  fileUrl: string;
  iconImageUrl: string | null;
  thumbnailImageUrl: string | null;
  originalImageUrl: string | null;
}

export interface CategoryLabel {
  name: string;
  labels: Record<string, string>;
  imageUrl: string | null;
}

export interface AttributeValue {
  filePath: string | null;
  defaultUnitCode: string | null;
  valueMap: Record<string, string>;
  valuesMap: Record<string, string[]>;
  priceMap: Record<string, unknown>;
}

export interface ProductAttribute {
  name: string;
  code: string;
  type: string;
  value: AttributeValue;
  labels: Record<string, string>;
}

export interface ProductByUpcResponse {
  id: string;
  name: string;
  upcId: string;
  approvalStatus: string | null;
  familyName: string;
  completenessPercent: number;
  assets: ProductAsset[];
  categoryMapping: Record<string, CategoryLabel[]>;
  attributeMapping: ProductAttribute[];
  labels: Record<string, string>;
}

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

/**
 * Fetch product details by UPC ID
 * @param upcId - The UPC ID of the product
 */
export function fetchProductByUpc(upcId: string): Promise<ProductByUpcResponse> {
  return fetchAPI<ProductByUpcResponse>(apiConfig.endpoints.productByUpc(upcId));
}

/**
 * Helper to get attribute value from ProductAttribute
 * Handles both valueMap (single value) and valuesMap (multi-value)
 */
export function getAttributeValue(attr: ProductAttribute, locale: string = "en"): string | string[] | null {
  const { valueMap, valuesMap } = attr.value;
  
  // Check for multi-value first
  if (valuesMap && valuesMap[locale] && valuesMap[locale].length > 0) {
    return valuesMap[locale];
  }
  
  // Then check single value
  if (valueMap && valueMap[locale]) {
    return valueMap[locale];
  }
  
  return null;
}

/**
 * Transform API response to a simpler product format for display
 */
export function transformProductResponse(response: ProductByUpcResponse) {
  // Get primary image URL from assets
  const imageAssets = response.assets.filter(a => a.assetType === "IMAGE");
  const imageBase = apiConfig.imageBase;
  const primaryImage = imageAssets[0]?.fileUrl ? `${imageBase}${imageAssets[0].fileUrl}` : "";
  const galleryImages = imageAssets.map(a => `${imageBase}${a.fileUrl}`);

  // Transform ALL attributes to specifications (include all regardless of value)
  const specifications = response.attributeMapping
    .map(attr => {
      const value = getAttributeValue(attr);
      // Include all attributes, even if empty
      return {
        label: attr.labels.en || attr.name,
        value: value 
          ? (Array.isArray(value) ? value.join(", ") : String(value))
          : "-",
        code: attr.code,
        type: attr.type,
      };
    });

  // Get description attribute if exists
  const descriptionAttr = response.attributeMapping.find(a => a.code === "description");
  const description = descriptionAttr ? getAttributeValue(descriptionAttr) as string : undefined;

  // Get brand if exists
  const brandAttr = response.attributeMapping.find(a => a.code === "brand_centric" || a.code === "brand");
  const brand = brandAttr ? getAttributeValue(brandAttr) as string : undefined;

  // Get categories
  const categories = Object.values(response.categoryMapping).flat();

  return {
    id: response.id,
    name: response.name,
    upcId: response.upcId,
    familyName: response.familyName,
    imageUrl: primaryImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : [primaryImage],
    specifications,
    description,
    brand,
    categories,
    completenessPercent: response.completenessPercent,
    approvalStatus: response.approvalStatus,
    rawAttributes: response.attributeMapping,
  };
}
