import { apiPost } from "./api";
import { apiConfig } from "../config/apiConfig";
import type { POUpdate } from "../components/home/UpdatesSection";

/**
 * Sales Order Search API Response Types
 */

export interface SalesOrderLineItem {
  upcId: string;
  requestedQuantity: number;
}

export interface SalesOrder {
  salesOrderId: number;
  applicationOrderId: string;
  subApplicationId: string;
  channelCode: string;
  orderType: string;
  lineItemInfo: SalesOrderLineItem[];
  orderDate: string;
  deliveryMode: string;
  requestState: string;
  consumerContactEmailAddress: string;
}

export interface SalesOrderSearchResponse {
  paginatedOrderList: SalesOrder[];
  totalRecords: number;
  noOfRows: number;
}

export interface SalesOrderSearchPayload {
  pageOffset: number;
  pageSize: number;
  orderBy: string;
  sortBy: string;
  requestState: string[];
  startDate: string | null;
  endDate: string | null;
  deliveryMode: string[];
  orderType: string[];
  salesOrderId: number | null;
  applicationOrderId: string | null;
  customerOrderId: string | null;
  duration: string | null;
  customerName: string | null;
  retailerAccountId: string | null;
}

/**
 * Fetch sales orders with search criteria
 */
export async function fetchSalesOrders(
  pageOffset: number = 0,
  pageSize: number = 20,
  retailerAccountId: string | null = null
): Promise<SalesOrder[]> {
  const payload: SalesOrderSearchPayload = {
    pageOffset,
    pageSize,
    orderBy: "DESC",
    sortBy: "createdOn",
    requestState: [],
    startDate: null,
    endDate: null,
    deliveryMode: [],
    orderType: [],
    salesOrderId: null,
    applicationOrderId: null,
    customerOrderId: null,
    duration: null,
    customerName: null,
    retailerAccountId,
  };

  const data = await apiPost<SalesOrderSearchResponse>(apiConfig.endpoints.salesOrderSearch, payload);
  return data.paginatedOrderList;
}

/**
 * Map sales order status to step index
 */
function mapRequestStateToStep(requestState: string): number {
  const stateMap: Record<string, number> = {
    UNPROCESSED: 0,
    RECEIVED: 1,
    ACCEPTED: 2,
    PROCESSED: 3,
    CANCELLED: 0,
  };
  return stateMap[requestState] ?? 0;
}

/**
 * Calculate total value from line items (using rough estimate since price not in response)
 */
function calculateTotalValue(lineItems: SalesOrderLineItem[]): number {
  // Since we don't have price info, return quantity as a placeholder
  // In real scenario, you'd need to fetch prices or include them in the response
  const totalQuantity = lineItems.reduce((sum, item) => sum + item.requestedQuantity, 0);
  return totalQuantity * 100; // Rough estimate: $100 per item
}

/**
 * Map a sales order to a POUpdate for display
 */
export function mapSalesOrderToUpdate(order: SalesOrder): POUpdate {
  return {
    type: "po",
    poNumber: `SO-${order.salesOrderId}`,
    orderDate: new Date(order.orderDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    totalValue: calculateTotalValue(order.lineItemInfo),
    currentStep: mapRequestStateToStep(order.requestState),
  };
}
