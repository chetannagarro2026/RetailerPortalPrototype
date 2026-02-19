/**
 * API Service
 * Centralized API request utilities with proper error handling
 */

// Azure APIM subscription key from environment
const API_SUBSCRIPTION_KEY = import.meta.env.VITE_AZURE_APIM_SUBSCRIPTION_KEY || "5881e307d1704219ae2e3759e6c5f1f0";

/**
 * Helper function to make API requests with proper error handling
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      "ocp-apim-subscription-key": API_SUBSCRIPTION_KEY,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Helper for GET requests
 */
export function apiGet<T>(endpoint: string): Promise<T> {
  return fetchAPI<T>(endpoint, { method: "GET" });
}

/**
 * Helper for POST requests
 */
export function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper for PUT requests
 */
export function apiPut<T>(endpoint: string, data?: unknown): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper for DELETE requests
 */
export function apiDelete<T>(endpoint: string): Promise<T> {
  return fetchAPI<T>(endpoint, { method: "DELETE" });
}
