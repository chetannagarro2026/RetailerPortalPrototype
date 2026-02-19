/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Product API Response Types
 */
export interface ProductApiItem {
  id: string;
  productName: string | null;
  labels: Record<string, string>;
  upcId: string;
  approvalStatus: string;
  completenessPercent: number;
  familyLabels: Record<string, string>;
  imageIconPath: string | null;
}

export interface ProductListResponse {
  content: ProductApiItem[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
