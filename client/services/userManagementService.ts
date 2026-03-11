/**
 * User Management Service
 * API calls related to user management (password reset, profile, etc.)
 */

import { apiConfig } from "../config/apiConfig";

const API_SUBSCRIPTION_KEY = import.meta.env.VITE_AZURE_APIM_SUBSCRIPTION_KEY || "5881e307d1704219ae2e3759e6c5f1f0";

// ── Types ───────────────────────────────────────────────────────────

export interface UserRole {
  roleId: number;
  roleName: string;
  roleDescription: string;
  roleType: string | null;
  permissions?: any[];
}

export interface UserDetails {
  userId: number;
  version: number;
  username: string;
  firstName: string;
  lastName: string;
  businessEmail: string;
  phone: string;
  isActive: boolean;
  userType: string | null;
  roleIds: number[] | null;
  sourceCodes: string[];
  countryIds: number[];
  serviceabilityAreaCodes: string[];
  roles: UserRole[];
  accountId: string | null;
}

export interface UserSearchResponse {
  paginatedOrderList: UserDetails[];
  totalRecords: number;
  noOfRows: number;
}

// ── API Functions ───────────────────────────────────────────────────

/**
 * Reset user password
 * @param oldPassword - Current password
 * @param newPassword - New password
 * @param accessToken - User's access token for authorization
 */
export async function resetPassword(
  oldPassword: string,
  newPassword: string,
  accessToken: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(apiConfig.endpoints.resetPassword, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "ocp-apim-subscription-key": API_SUBSCRIPTION_KEY,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to reset password" }));
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "Password reset successfully",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(message);
  }
}

/**
 * Search for user by username
 * @param username - Username to search for
 * @param accessToken - User's access token for authorization
 */
export async function searchUserByUsername(
  username: string,
  accessToken: string
): Promise<UserDetails | null> {
  try {
    const response = await fetch(apiConfig.endpoints.userSearch, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "ocp-apim-subscription-key": API_SUBSCRIPTION_KEY,
      },
      body: JSON.stringify({
        searchKeyword: "",
        sources: [],
        userId: "",
        userName: username,
        orderBy: "createdOn",
        sortBy: "DESC",
        pageOffset: 0,
        pageSize: 20,
        isActive: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to search user: HTTP ${response.status}`);
    }

    const data: UserSearchResponse = await response.json();
    
    if (data.paginatedOrderList && data.paginatedOrderList.length > 0) {
      return data.paginatedOrderList[0];
    }
    
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(message);
  }
}

/**
 * Update user profile
 * @param userDetails - Complete user details with updated fields
 * @param accessToken - User's access token for authorization
 */
export async function updateUserProfile(
  userDetails: {
    userId: number;
    version: number;
    username: string;
    firstName: string;
    lastName: string;
    businessEmail: string;
    phone: string;
    roleIds: number[];
    sourceCodes: string[];
    serviceabilityAreaCodes: string[];
    countryIds: number[];
    isActive: boolean;
  },
  accessToken: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(apiConfig.endpoints.userUpdate, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "ocp-apim-subscription-key": API_SUBSCRIPTION_KEY,
      },
      body: JSON.stringify(userDetails),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update profile" }));
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "Profile updated successfully",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(message);
  }
}
