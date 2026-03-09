import { apiPost, apiGet } from "./api";
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
  caseType?: string[];
  salesOrderId: number | null;
  applicationOrderId: string | null;
  customerOrderId: string | null;
  duration: string | null;
  customerName: string | null;
  retailerAccountId: string | null;
}

export interface SalesOrderStatusCountResponse {
  ALL: number;
  PROCESSING: number;
  PARTIALLY_PROCESSING: number;
  PARTIALLY_REJECTED: number;
  PARTIALLY_UNPROCESSED: number;
  INVOICE_CREATED: number;
  RECEIVED: number;
  PARTIALLY_PROCESSED: number;
  CANCELLED: number;
  UNPROCESSED: number;
  COMPLETED: number;
  ACCEPTED: number;
  PARTIALLY_COMPLETED: number;
  RESOLVED: number;
  RETURNED: number;
  PROCESSED: number;
  PARTIALLY_RETURNED: number;
  ON_HOLD: number;
  REJECTED: number;
}

// ── Sales Order Detail Types ────────────────────────────────────────

export interface SalesOrderContact {
  id: number;
  contactID: string;
  givenName: string;
  familyName: string;
  taxJurisdictionCode: string;
  addressLine1: string;
  addressLine2: string;
  cityName: string;
  stateProvinceName: string;
  countryCode: string;
  postalCode: string;
  dialPhoneNumber: string;
  mobilePhoneNumber: string;
  freeFormPhoneNumber: string;
  emailAddressID: string;
  createdOn: string;
  modifiedOn: string;
  addressType: string;
}

export interface SalesOrderPaymentInfo {
  payMethodCode: string;
  payMethodType: string;
  payMethodName: string;
  paymentService: string;
  paymentProvider: string;
  authorizationAmount: number;
  authorizationAmountCurrencyCode: string;
  billingContact: SalesOrderContact | null;
  createdOn: string;
  modifiedOn: string;
}

export interface SalesOrderCarton {
  cartonId: number;
  carrierTrackingID: string;
  enterpriseTrackingID: string;
  shipDate: string;
  packQuantity: number;
  status: string | null;
  estimatedDeliveryDate: string | null;
  logisticCarrierName: string | null;
}

export interface SalesOrderDetailLineItem {
  salesOrderlineItemId: number;
  lineID: string;
  upcID: string;
  skuID: string;
  productCategory: string;
  sourceSystemItemDescription: string;
  sourceSystemItemColorDescription: string;
  sourceSystemItemSizeDescription: string;
  unitPriceSellingAmount: number;
  unitPriceSellingAmountCurrencyCode: string;
  unitPriceRetailAmount: number;
  requestedQuantity: number;
  fulfilledQuantity: number;
  shippedQuantity: number;
  cancelledQuantity: number;
  returnedQuantity: number;
  taxAmount: number;
  taxCurrencyCode: string;
  shippingAmount: number;
  shippingAmountCurrencyCode: string;
  shippingModeServiceLevelCode: string;
  shippingModeServiceLevelName: string;
  shippingModeExpectedDuration: string;
  shippingContact: SalesOrderContact | null;
  status: string;
  cartons: SalesOrderCarton[];
}

export interface SalesOrderStateTimeline {
  state: string;
  changeDateTime: string;
  fromDate: string;
  toDate: string | null;
  modifiedBy: string;
}

export interface SalesOrderDetail {
  accountId: string;
  omsOrderID: number;
  orderType: string;
  applicationID: string;
  applicationOrderID: string;
  customerOrderID: string;
  enterpriseOrderID: string;
  brandID: string;
  channelCode: string;
  status: string;
  salesOrderState: string;
  currencyCode: string;
  createDateTime: string;
  customerOrderDate: string;
  requestedDate: string;
  deliveryMode: string;
  orderTotalAmount: number;
  orderTotalCurrencyCode: string;
  orderTotalDiscountAmount: number;
  orderTotalSalesTaxAmount: number;
  orderTotalBeforeTaxValue: number;
  orderShippingTotalValue: number;
  orderItemTotalValue: number;
  estimatedDeliveryDate: string;
  paymentInformations: SalesOrderPaymentInfo[];
  salesOrderLineItems: SalesOrderDetailLineItem[];
  stateTimeline: SalesOrderStateTimeline[];
  soldTo: string;
  shipTo: string;
  billTo: string;
  retailerAccountId: string;
}

// ── API Functions ───────────────────────────────────────────────────

export interface FetchSalesOrdersResult {
  orders: SalesOrder[];
  totalRecords: number;
}

/**
 * Fetch sales orders with search criteria
 */
export async function fetchSalesOrders(
  pageOffset: number = 0,
  pageSize: number = 20,
  retailerAccountId: string | null = null,
  requestStates: string[] = []
): Promise<SalesOrder[]> {
  const payload: SalesOrderSearchPayload = {
    pageOffset,
    pageSize,
    orderBy: "DESC",
    sortBy: "createdOn",
    requestState: requestStates,
    startDate: null,
    endDate: null,
    deliveryMode: [],
    orderType: [],
    salesOrderId: null,
    applicationOrderId: null,
    customerOrderId: null,
    duration: null,
    customerName: null,
    retailerAccountId: retailerAccountId,
  };

  const data = await apiPost<SalesOrderSearchResponse>(apiConfig.endpoints.salesOrderSearch, payload);
  return data.paginatedOrderList;
}

/**
 * Fetch sales orders with pagination info
 */
export async function fetchSalesOrdersWithPagination(
  pageOffset: number = 0,
  pageSize: number = 10,
  retailerAccountId: string | null = null,
  requestStates: string[] = []
): Promise<FetchSalesOrdersResult> {
  const payload: SalesOrderSearchPayload = {
    pageOffset,
    pageSize,
    orderBy: "DESC",
    sortBy: "createdOn",
    requestState: requestStates,
    startDate: null,
    endDate: null,
    deliveryMode: [],
    orderType: [],
    salesOrderId: null,
    applicationOrderId: null,
    customerOrderId: null,
    duration: null,
    customerName: null,
    retailerAccountId: "9038",
  };

  const data = await apiPost<SalesOrderSearchResponse>(apiConfig.endpoints.salesOrderSearch, payload);
  return {
    orders: data.paginatedOrderList,
    totalRecords: data.totalRecords,
  };
}

/**
 * Fetch sales order by ID
 */
export async function fetchSalesOrderById(orderId: number): Promise<SalesOrderDetail> {
  return apiGet<SalesOrderDetail>(apiConfig.endpoints.salesOrderById(orderId));
}

/**
 * Fetch sales order status counts
 */
export async function fetchSalesOrderStatusCounts(
  retailerAccountId: string | null = null
): Promise<SalesOrderStatusCountResponse> {
  const payload: SalesOrderSearchPayload = {
    pageOffset: 0,
    pageSize: 50,
    orderBy: "DESC",
    sortBy: "createdOn",
    requestState: [],
    startDate: null,
    endDate: null,
    deliveryMode: [],
    orderType: [],
    caseType: [],
    salesOrderId: null,
    applicationOrderId: null,
    customerOrderId: null,
    duration: null,
    customerName: null,
    retailerAccountId: "9038",
  };

  const data = await apiPost<SalesOrderStatusCountResponse>(apiConfig.endpoints.salesOrderCountStatus, payload);
  return data;
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
