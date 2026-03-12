/**
 * Sourcing Service
 * Handles sourcing and delivery date estimation API calls
 */

import { apiConfig } from "../config/apiConfig";
import { apiPost } from "./api";

// ── Types ───────────────────────────────────────────────────────────

export interface SourcingRequest {
  upcList: Array<{
    upc: string;
    quantity: number;
    productCategory: string;
  }>;
  facilityIds: string[];
  channelCode: string;
  distributionGroupId: string;
  orderType: string;
  ecommerceId: number;
  customerDetails: {
    customerType: string[];
    customerEmailId: string;
    customerId: number;
  };
  shippingAddressZipCode: string;
  shippingMode: string;
  isOrderGiftWrap: boolean;
}

export interface SourcingResponse {
  isAvailable: boolean;
  pickFacilityIds: string[];
  sfsAvailabilityDetails: Array<{
    upc: string;
    facilityId: string;
    fullfilledQty: number;
  }>;
  unfullfilledItemDetails: Array<{
    upc: string;
    requestedQty: number;
    unfullfilledQty: number;
  }>;
  message: string;
  exception: string | null;
}

export interface DeliveryEstimateRequest {
  applicationOrderId: number;
  subApplicationOrderId: number;
  deliveryMode: string;
  facilityId: string;
  upcId: string;
  shippingAddressZipCode: string;
  destinationPincode: string;
  sourceCodes: string[];
}

export interface DeliveryEstimateResponse {
  originalTransitTime: number;
  orderPreparationTime: number;
  finalTransitTime: number;
  estimatedDeliveryDate: string;
  upcId: string;
}

// ── API Functions ───────────────────────────────────────────────────

/**
 * Call sourcing API to determine fulfillment facilities
 */
export async function getSourcing(request: SourcingRequest): Promise<SourcingResponse> {
  return apiPost<SourcingResponse>(apiConfig.endpoints.sourcing, request);
}

/**
 * Get delivery date estimate for sourced items
 */
export async function getDeliveryEstimate(
  request: DeliveryEstimateRequest
): Promise<DeliveryEstimateResponse> {
  return apiPost<DeliveryEstimateResponse>(apiConfig.endpoints.deliveryEstimate, request);
}

/**
 * Helper function to get delivery estimates for all cart items
 * @param items Cart items with UPC and quantity
 * @param zipCode Shipping address zip code
 * @param sourcingResponse Response from sourcing API
 */
export async function getDeliveryEstimatesForCart(
  items: Array<{ upc: string; quantity: number }>,
  zipCode: string,
  sourcingResponse: SourcingResponse
): Promise<Record<string, DeliveryEstimateResponse>> {
  const estimates: Record<string, DeliveryEstimateResponse> = {};

  // Get delivery estimates for each unique UPC
  const promises = sourcingResponse.sfsAvailabilityDetails.map(async (detail) => {
    try {
      const estimate = await getDeliveryEstimate({
        applicationOrderId: 1236,
        subApplicationOrderId: 2360,
        deliveryMode: "SHIP",
        facilityId: detail.facilityId,
        upcId: detail.upc,
        shippingAddressZipCode: zipCode,
        destinationPincode: zipCode,
        sourceCodes: [detail.facilityId],
      });
      estimates[detail.upc] = estimate;
    } catch (error) {
      console.error(`Failed to get delivery estimate for UPC ${detail.upc}:`, error);
    }
  });

  await Promise.all(promises);
  return estimates;
}
