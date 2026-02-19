import { apiPost } from "./api";
import { apiConfig } from "../config/apiConfig";

/**
 * Purchase Order API Response Types
 */

export interface POStatus {
  purchaseOrderStatusId: number;
  status: string;
  changeDateTime: string;
  reason: string;
  reasonCode: string;
  fromDate: string;
  toDate?: string;
}

export interface POLineItem {
  purchaseOrderLineItemId: number;
  status: string;
  enterpriseItemID: string;
  supplierItemID: string;
  customerItemID: string;
  upcID: string;
  skuID: string;
  uomCode: string;
  requestedQuantity: number;
  cancelledQuantity: number;
  returnedQuantity: number;
  fulfilledQuantity?: number;
  productDescription: string;
  productSize: string;
  retailPrice: number;
  buyingPrice: number;
}

export interface BillingContact {
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

export interface PaymentInformation {
  paymentInformationId: number;
  payMethodType: string;
  paymentAccountExpirationMonth: string;
  paymentAccountExpirationYear: string;
  accountSuffix: string;
  authorizationAmount: number;
  authorizationAmountCurrencyCode: string;
  authorizationCode: string;
  payMethodName: string;
  paymentService: string;
  paymentID: string;
  paymentProvider: string;
  settlementID: string;
  settlementRequestID: string;
  authorizationID: string;
  billingContact: BillingContact;
}

export interface PurchaseSuggestion {
  purchaseSuggestionId: number;
  purchaseOrderId: number;
  requisitionId: number;
  purchaseRequisition: null | unknown;
  omsOrderId: number | null;
  salesOrderLineItemId: number | null;
  fulfillmentOrderId: number | null;
}

export interface PORecord {
  purchaseOrderId: number;
  status: POStatus[];
  currentState: string;
  lineItems: POLineItem[];
  purchaseSuggestions: PurchaseSuggestion[];
  countryCode: string;
  priorityCode: string;
  soldTo: string;
  shipTo: string;
  billTo: string;
  currencyCode: string;
  paymentInformations: PaymentInformation[];
  createDateTime: string;
  orderTotalAmount: number;
  orderTotalCurrencyCode: string;
  orderTotalDiscountAmount: number;
  orderTotalDiscountCurrencyCode: string;
  orderShippingTotalValue: number;
  orderShippingTotalCurrencyCode: string;
  cancelDate: string;
  settlementDate: string;
  shipmentID: string;
  customerOrderDate: string;
  deliveryMode: string;
  supplierOrderID: string;
  supplierID: string;
  supplierName: string;
  invoices: unknown[];
  sourceCode: string;
  salesExecutiveName: string;
}

export interface POSearchResponse {
  records: PORecord[];
  totalRecords: number;
  noOfRows: number;
}

/**
 * Fetch purchase orders with search criteria
 */
export async function fetchPurchaseOrders(
  pageOffset: number = 0,
  pageSize: number = 20
): Promise<PORecord[]> {
  const payload = {
    orderStatus: [],
    sourceCodes: [],
    deliveryModes: [],
    pageOffset,
    pageSize,
    orderBy: "DESC",
    sortBy: "createdOn",
    supplierID: null,
    purchaseOrderId: null,
    startDate: null,
    endDate: null,
  };

  const data = await apiPost<POSearchResponse>(apiConfig.endpoints.poSearch, payload);
  return data.records;
}

/**
 * Map PO records to update items with status progress
 * Status progression: CREATED -> PO_ACCEPTED -> ASN -> GOODS_RECEIVED -> INVOICE_RECEIVED -> PO_COMPLETED
 */
export function mapPOToUpdate(po: PORecord) {
  const statusOrder: Record<string, number> = {
    CREATED: 0,
    PO_ACCEPTED: 1,
    ASN: 2,
    GOODS_RECEIVED: 3,
    INVOICE_RECEIVED: 4,
    PO_COMPLETED: 5,
  };

  const currentStep = statusOrder[po.currentState] ?? 0;
  const orderDate = new Date(po.createDateTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    type: "po" as const,
    poNumber: `PO-${po.purchaseOrderId}`,
    orderDate,
    totalValue: Math.round(po.orderTotalAmount),
    currentStep,
  };
}
