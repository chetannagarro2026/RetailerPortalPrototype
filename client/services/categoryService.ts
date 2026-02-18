import { apiConfig } from "../config/apiConfig";
import { apiGet } from "./api";

export type CategoryItem = {
  id: string;
  name: string;
  code?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  parentCategoryId?: string | null;
  productIds?: string[];
  leafNode?: boolean;
  approvalStatus?: string;
  labels?: Record<string, string>;
};

/**
 * Fetch categories under a parent id. The API may return a flat list; UI builds tree.
 */
export function fetchCategoriesByParent(parentId: string) {
  const endpoint = apiConfig.endpoints.categoriesTreeByParent(parentId);
  return apiGet<CategoryItem[]>(endpoint);
}
