/**
 * Sales Order Service
 * Handles creation of sales orders via the Sales Order API
 */

import { apiConfig } from "../config/apiConfig";
import type { OrderLineItem } from "../context/OrderContext";

// ── Utilities ───────────────────────────────────────────────────────

function generate7DigitRandomNumber(): string {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

// ── Types ───────────────────────────────────────────────────────────

export interface SalesOrderResponse {
  omsOrderId: number;
  orderStatus: string;
  applicationId: string;
  applicationOrderID: string;
  alternateOrderID: string;
  customerOrderID: string;
  enterpriseOrderID: string;
  channelID: string;
  subApplicationID: string;
}

interface BillingContact {
  addressLine1: string;
  addressLine2: string;
  cityName: string;
  contactID: string;
  countryCode: string;
  dialPhoneNumber: string;
  emailAddressID: string;
  familyName: string;
  freeFormPhoneNumber: string;
  givenName: string;
  mobilePhoneNumber: string;
  postalCode: string;
  stateProvinceName: string;
  taxJurisdictionCode: string;
}

interface PaymentInformation {
  accountSuffix: string;
  authorizationAmount: number;
  authorizationAmountCurrencyCode: string;
  authorizationCode: string;
  authorizationID: string;
  billingContact: BillingContact;
  paymentAccountExpirationMonth: string;
  paymentAccountExpirationYear: string;
  paymentID: string;
  paymentProvider: string;
  paymentService: string;
  payMethodCode: string;
  payMethodName: string;
  payMethodType: string;
  settlementID: string;
  settlementRequestID: string;
}

interface ShippingContact {
  addressLine1: string;
  addressLine2: string;
  cityName: string;
  contactID: string;
  countryCode: string;
  dialPhoneNumber: string;
  emailAddressID: string;
  familyName: string;
  freeFormPhoneNumber: string;
  givenName: string;
  mobilePhoneNumber: string;
  postalCode: string;
  stateProvinceName: string;
  taxJurisdictionCode: string;
}

interface Carton {
  carrierTrackingID: string;
  enterpriseTrackingID: string;
  packQuantity: number;
  shipDate: string;
  shippingModeCarrierServiceLevelCode: string;
  shippingModeCarrierServiceLevelName: string;
  shippingModeTransportationMethodCode: string;
}

interface SalesOrderLineItem {
  dyoInd: string;
  lineID: string;
  enterpriseItemID: string;
  supplierItemID: string;
  customerItemID: string;
  upcID: string;
  skuID: string;
  articleID: string;
  serialIDValue: string;
  serialIDExpirationDateTime: string;
  serialIDIssueDateTime: string;
  uomCode: string;
  unitPriceSellingAmount: number;
  unitPriceSellingAmountCurrencyCode: string;
  unitPriceRetailAmount: number;
  unitPriceRetailAmountCurrencyCode: string;
  unitPriceSuggestedRetailAmount: number;
  unitPriceSuggestedRetailAmountCurrencyCode: string;
  unitPriceOriginalSellingAmount: number;
  unitPriceOriginalSellingAmountCurrencyCode: string;
  unitPriceBreakDiscountAmount: number;
  unitPriceBreakDiscountPercent: string;
  unitPriceBreakPriceBreakQuantity: number;
  unitPriceBreakPriceBreakAmount: number;
  taxAmount: number;
  taxCurrencyCode: string;
  taxJurisdictionCode: string;
  districtTaxAmount: number;
  districtTaxCurrencyCode: string;
  countyTaxAmount: number;
  countyTaxCurrencyCode: string;
  stateTaxAmount: number;
  stateTaxCurrencyCode: string;
  cityTaxAmount: number;
  cityTaxCurrencyCode: string;
  requestedQuantity: string;
  productCategory: string;
  shippedQuantity: number;
  cancelledQuantity: number;
  returnedQuantity: number;
  extendedPriceSellingAmount: number;
  extendedPriceSellingAmountCurrencyCode: string;
  extendedPriceOriginalSellingAmount: number;
  extendedPriceOriginalSellingAmountCurrencyCode: string;
  facilityIDShipFrom: string;
  facilityIDShipTo: string;
  facilityIDMarkFor: string;
  facilityIDLabel: string;
  facilityIDPickupFrom: string;
  shippingAmount: number;
  shippingAmountCurrencyCode: string;
  shippingSalesTaxAmount: number;
  shippingSalesTaxAmountCurrencyCode: string;
  shippingModeServiceLevelCode: string;
  shippingModeServiceLevelName: string;
  shippingModeExpectedDuration: string;
  shippingContact: ShippingContact;
  giftLineInd: string;
  giftWrapInd: string;
  giftWrapUnitPriceAmount: number;
  giftWrapSalesTaxAmount: number;
  giftMessage: string;
  sourceSystemItemDescription: string;
  sourceSystemItemColorDescription: string;
  sourceSystemItemSizeDescription: string;
  pickupCollectionPointDate: string;
  pickupCollectionPointCode: string;
  pickupCollectionPointName: string;
  itemCatalogID: string;
  status: string;
  changeDateTime: string;
  cartons: Carton[];
}

interface VasListItem {
  code: string;
  description: string;
  supplementalText: string;
  typeCode: string;
}

interface SalesOrderPayload {
  salesExecutiveName: string;
  alternateOrderID: string;
  applicationID: string;
  applicationOrderID: string;
  billTo: string;
  brandID: string;
  businessID: string;
  accountId: string;
  retailerAccountId: string;
  retailerSourceAccountId: string | null;
  channelCode: string;
  coalitionID: string;
  consumerContactEmailAddressID: string;
  countryCode: string;
  currencyCode: string;
  customerOrderID: string;
  customerName: string;
  customerType: string;
  deliveryMode: string;
  enterpriseOrderID: string;
  inventoryChannel: string;
  inventoryChannelID: string;
  loyaltyID: string;
  orderLanguageCode: string;
  orderType: string;
  priorityCode: string;
  registeredConsumerInd: string;
  requestedDate: string;
  shipTo: string;
  soldTo: string;
  status: string;
  stockDYOCode: string;
  subApplicationID: string;
  taxJurisdictionCode: string;
  cityTaxAmount: number;
  cityTaxCurrencyCode: string;
  countyTaxAmount: number;
  countyTaxCurrencyCode: string;
  createDateTime: string;
  districtTaxAmount: number;
  districtTaxCurrencyCode: string;
  stateTaxAmount: number;
  stateTaxCurrencyCode: string;
  taxAmount: number;
  taxCurrencyCode: string;
  orderItemTotalCurrencyCode: string;
  orderItemTotalSalesTaxCurrencyCode: string;
  orderItemTotalSalesTaxValue: string;
  orderItemTotalValue: number;
  orderShippingTotalCurrencyCode: string;
  orderShippingTotalSalesTaxCode: string;
  orderShippingTotalSalesTaxCurrencyCode: string;
  orderShippingTotalSalesTaxRate: string;
  orderShippingTotalSalesTaxValue: number;
  orderShippingTotalValue: number;
  orderTotalAmount: number;
  orderTotalBeforeCurrencyCode: string;
  orderTotalBeforeTaxValue: string;
  orderTotalCurrencyCode: string;
  orderTotalDiscountAmount: number;
  orderTotalDiscountCurrencyCode: string;
  orderTotalSalesTaxAmount: number;
  orderTotalSalesTaxCode: string;
  orderTotalSalesTaxCurrencyCode: string;
  orderTotalSalesTaxRate: string;
  giftFromCity: string;
  giftFromEmail: string;
  giftFromFamilyName: string;
  giftFromGivenName: string;
  giftMessage: string;
  giftOrderInd: string;
  giftToCity: string;
  giftToEmail: string;
  giftToFamilyName: string;
  giftToGivenName: string;
  giftWrapInd: string;
  giftWrapSalesTaxAmount: string;
  giftWrapUnitPriceAmount: string;
  paymentInformations: PaymentInformation[];
  salesOrderLineItems: SalesOrderLineItem[];
  settlementDate: string;
  promotionID: string;
  sourceCode: string;
  changeDateTime: string;
  customerCancelDate: string;
  vasList: VasListItem[];
}

interface ShippingAddress {
  contactName: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface CreateSalesOrderParams {
  items: OrderLineItem[];
  totalValue: number;
  totalUnits: number;
  shipping: ShippingAddress;
  accountId: string;
  retailerAccountId: string;
  orderNumber: string;
}

// ── API Function ────────────────────────────────────────────────────

/**
 * Create a sales order
 */
export async function createSalesOrder(params: CreateSalesOrderParams): Promise<SalesOrderResponse> {
  const now = new Date().toISOString();
  const randomId = generate7DigitRandomNumber();

  // Split contact name into given and family names
  const nameParts = params.shipping.contactName.split(" ");
  const givenName = nameParts[0] || "";
  const familyName = nameParts.slice(1).join(" ") || "";

  const payload: SalesOrderPayload = {
    salesExecutiveName: "",
    alternateOrderID: randomId,
    applicationID: randomId,
    applicationOrderID: randomId,
    billTo: params.shipping.zip,
    brandID: "TB",
    businessID: "TBL:US:EC:17",
    accountId: params.accountId,
    retailerAccountId: params.retailerAccountId,
    retailerSourceAccountId: null,
    channelCode: "CENTRIC_USA_ECOM",
    coalitionID: "IW",
    consumerContactEmailAddressID: "",
    countryCode: "USA",
    currencyCode: "EUR",
    customerOrderID: randomId,
    customerName: params.shipping.companyName.substring(0, 32), // Max length 32
    customerType: "STANDARD",
    deliveryMode: "STANDARD_SHIPPING",
    enterpriseOrderID: randomId,
    inventoryChannel: "SE_FR_ECOM",
    inventoryChannelID: "SE_FR_ECOM",
    loyaltyID: "7777",
    orderLanguageCode: "en",
    orderType: "DELIVERY",
    priorityCode: "MEDIUM",
    registeredConsumerInd: "FALSE",
    requestedDate: now,
    shipTo: params.shipping.zip,
    soldTo: params.shipping.zip,
    status: "CREATED",
    stockDYOCode: "STOCK",
    subApplicationID: randomId,
    taxJurisdictionCode: "",
    
    // Hardcoded tax values
    cityTaxAmount: 12356.00,
    cityTaxCurrencyCode: "EUR",
    countyTaxAmount: 12356.00,
    countyTaxCurrencyCode: "EUR",
    createDateTime: now,
    districtTaxAmount: 12356.00,
    districtTaxCurrencyCode: "EUR",
    stateTaxAmount: 12356.00,
    stateTaxCurrencyCode: "EUR",
    taxAmount: 12356.00,
    taxCurrencyCode: "EUR",
    
    // Order totals
    orderItemTotalCurrencyCode: "EUR",
    orderItemTotalSalesTaxCurrencyCode: "EUR",
    orderItemTotalSalesTaxValue: "657657",
    orderItemTotalValue: parseFloat(params.totalValue.toFixed(2)),
    orderShippingTotalCurrencyCode: "EUR",
    orderShippingTotalSalesTaxCode: "test",
    orderShippingTotalSalesTaxCurrencyCode: "EUR",
    orderShippingTotalSalesTaxRate: "675765",
    orderShippingTotalSalesTaxValue: 0.00,
    orderShippingTotalValue: 0.00,
    orderTotalAmount: parseFloat(params.totalValue.toFixed(2)),
    orderTotalBeforeCurrencyCode: "EUR",
    orderTotalBeforeTaxValue: params.totalValue.toFixed(2),
    orderTotalCurrencyCode: "EUR",
    orderTotalDiscountAmount: 0.00,
    orderTotalDiscountCurrencyCode: "EUR",
    orderTotalSalesTaxAmount: 36.67,
    orderTotalSalesTaxCode: "test",
    orderTotalSalesTaxCurrencyCode: "EUR",
    orderTotalSalesTaxRate: "64674",
    
    // Hardcoded gift details
    giftFromCity: "La Celle-saint-cloud",
    giftFromEmail: "rosespie@nxcorp.com",
    giftFromFamilyName: "Pierce",
    giftFromGivenName: "Rose S",
    giftMessage: "abc",
    giftOrderInd: "879",
    giftToCity: "La Celle-saint-cloud",
    giftToEmail: "joy@gmail.com",
    giftToFamilyName: "Joy",
    giftToGivenName: "Joy",
    giftWrapInd: "789",
    giftWrapSalesTaxAmount: "2345",
    giftWrapUnitPriceAmount: "45434",
    
    // Payment information
    paymentInformations: [
      {
        accountSuffix: "SA",
        authorizationAmount: 4441.00,
        authorizationAmountCurrencyCode: "EUR",
        authorizationCode: "PA",
        authorizationID: "23423523",
        billingContact: {
          addressLine1: "172",
          addressLine2: params.shipping.address,
          cityName: params.shipping.city,
          contactID: "1234",
          countryCode: "USA",
          dialPhoneNumber: params.shipping.phone,
          emailAddressID: "",
          familyName: familyName,
          freeFormPhoneNumber: params.shipping.phone,
          givenName: givenName,
          mobilePhoneNumber: params.shipping.phone,
          postalCode: params.shipping.zip,
          stateProvinceName: params.shipping.state,
          taxJurisdictionCode: "",
        },
        paymentAccountExpirationMonth: "02/24",
        paymentAccountExpirationYear: "02/24",
        paymentID: "214234",
        paymentProvider: "PAYPAL",
        paymentService: "VISA",
        payMethodCode: "VISA4-1",
        payMethodName: "WPCARDS",
        payMethodType: "CC",
        settlementID: "33434",
        settlementRequestID: "232",
      },
    ],
    
    // Line items
    salesOrderLineItems: params.items.map((item, index) => {
      const lineTotal = item.quantity * item.unitPrice;
      
      return {
        dyoInd: "Y",
        lineID: (index + 1).toString(),
        enterpriseItemID: "TB:010061:713:070:W:1:",
        supplierItemID: "test",
        customerItemID: "4545",
        upcID: item.sku,
        skuID: item.sku,
        articleID: "test",
        serialIDValue: "9898",
        serialIDExpirationDateTime: "test",
        serialIDIssueDateTime: "test",
        uomCode: "EA",
        unitPriceSellingAmount: 99.99,
        unitPriceSellingAmountCurrencyCode: "EUR",
        unitPriceRetailAmount: 99.99,
        unitPriceRetailAmountCurrencyCode: "EUR",
        unitPriceSuggestedRetailAmount: 12345.00,
        unitPriceSuggestedRetailAmountCurrencyCode: "EUR",
        unitPriceOriginalSellingAmount: parseFloat(item.unitPrice.toFixed(2)),
        unitPriceOriginalSellingAmountCurrencyCode: "EUR",
        unitPriceBreakDiscountAmount: 0.00,
        unitPriceBreakDiscountPercent: "6577",
        unitPriceBreakPriceBreakQuantity: 12345.00,
        unitPriceBreakPriceBreakAmount: 12345.00,
        taxAmount: 36.67,
        taxCurrencyCode: "EUR",
        taxJurisdictionCode: "EUR",
        districtTaxAmount: 0.00,
        districtTaxCurrencyCode: "EUR",
        countyTaxAmount: 0.00,
        countyTaxCurrencyCode: "EUR",
        stateTaxAmount: 36.67,
        stateTaxCurrencyCode: "EUR",
        cityTaxAmount: 0.00,
        cityTaxCurrencyCode: "EUR",
        requestedQuantity: item.quantity.toString(),
        productCategory: Object.entries(item.variantAttributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ") || "General",
        shippedQuantity: 0,
        cancelledQuantity: 0,
        returnedQuantity: 0,
        extendedPriceSellingAmount: 36.67,
        extendedPriceSellingAmountCurrencyCode: "EUR",
        extendedPriceOriginalSellingAmount: 36.67,
        extendedPriceOriginalSellingAmountCurrencyCode: "EUR",
        facilityIDShipFrom: "S574",
        facilityIDShipTo: "S574",
        facilityIDMarkFor: "S574",
        facilityIDLabel: "S574",
        facilityIDPickupFrom: "S574",
        shippingAmount: 0.00,
        shippingAmountCurrencyCode: "EUR",
        shippingSalesTaxAmount: 0.00,
        shippingSalesTaxAmountCurrencyCode: "EUR",
        shippingModeServiceLevelCode: "STA",
        shippingModeServiceLevelName: "standard",
        shippingModeExpectedDuration: "24-48 hours",
        shippingContact: {
          addressLine1: params.shipping.address,
          addressLine2: params.shipping.address,
          cityName: params.shipping.city,
          contactID: "",
          countryCode: "USA",
          dialPhoneNumber: params.shipping.phone,
          emailAddressID: "",
          familyName: familyName,
          freeFormPhoneNumber: params.shipping.phone,
          givenName: givenName,
          mobilePhoneNumber: params.shipping.phone,
          postalCode: params.shipping.zip,
          stateProvinceName: params.shipping.state,
          taxJurisdictionCode: "test",
        },
        giftLineInd: "345",
        giftWrapInd: "456",
        giftWrapUnitPriceAmount: 36.67,
        giftWrapSalesTaxAmount: 36.67,
        giftMessage: "abc",
        sourceSystemItemDescription: item.productName,
        sourceSystemItemColorDescription: item.variantAttributes.Color || "Orange",
        sourceSystemItemSizeDescription: item.variantAttributes.Size || "Medium",
        pickupCollectionPointDate: now,
        pickupCollectionPointCode: "test",
        pickupCollectionPointName: "test",
        itemCatalogID: "96895",
        status: "CREATED",
        changeDateTime: now,
        cartons: [
          {
            carrierTrackingID: "nbkjk",
            enterpriseTrackingID: "nsbkjckjc",
            packQuantity: 1234.99,
            shipDate: "2020-06-10T11:11:01.022-04:00[GMT-04:00]",
            shippingModeCarrierServiceLevelCode: "456",
            shippingModeCarrierServiceLevelName: "4546",
            shippingModeTransportationMethodCode: "6545",
          },
        ],
      };
    }),
    
    settlementDate: now,
    promotionID: "test",
    sourceCode: "abc",
    changeDateTime: "12",
    customerCancelDate: "12",
    
    // Hardcoded vasList
    vasList: [
      {
        code: "TChannelRequest",
        description: "TK:VA:T05-CUSTOMER PRODUCT DES:6-inch Boot Premium pour homme en jaune",
        supplementalText: "test",
        typeCode: "T",
      },
      {
        code: "TChannelRequest12",
        description: "TK:VA:T13-CST/CLR:jaune",
        supplementalText: "TK:VA:T13-CST/CLR:jaune",
        typeCode: "T",
      },
      {
        code: "TChannelRequest123",
        description: "TK:VA:T43-Customer Size Desc:40 W",
        supplementalText: "TK:VA:T13-CST/CLR:jaune",
        typeCode: "T",
      },
    ],
  };

  const subscriptionKey = import.meta.env.VITE_AZURE_APIM_SUBSCRIPTION_KEY || "";

  const response = await fetch(apiConfig.endpoints.salesOrderCreate, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": subscriptionKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create sales order: ${response.status} ${errorText}`);
  }

  return response.json();
}
