/**
 * Authentication Service
 * Handles Keycloak authentication and user management
 */

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "https://ndoms-keycloak-dev-dns.centralindia.azurecontainer.io";
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || "ndoms";
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "frontend-react";

const AZURE_APIM_BASE = import.meta.env.VITE_AZURE_APIM_BASE_URL || "https://ndoms-dev-apim.azure-api.net";
const USER_MANAGEMENT_PATH = import.meta.env.VITE_USER_MANAGEMENT_API_PATH || "/user-management/dev/api/v1";
const API_SUBSCRIPTION_KEY = import.meta.env.VITE_AZURE_APIM_SUBSCRIPTION_KEY || "5881e307d1704219ae2e3759e6c5f1f0";

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  "not-before-policy": number;
  session_state: string;
  scope: string;
}

export interface UserRole {
  roleId: number;
  roleName: string;
  roleDescription: string;
}

export interface UserInfo {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  businessEmail: string;
  phone: string;
  accountId: string;
  userType: string;
  active: boolean;
  roles: UserRole[];
  countries: string[];
  serviceabilityAreas: any[];
  sources: any[];
  version: number;
  createdBy: string | null;
  updatedBy: string | null;
  [key: string]: any;
}

/**
 * Sign in with username and password
 */
export async function signInWithCredentials(
  username: string,
  password: string
): Promise<TokenResponse> {
  const tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const formData = new URLSearchParams();
  formData.append("client_id", KEYCLOAK_CLIENT_ID);
  formData.append("grant_type", "password");
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "authentication_failed" }));
    throw new Error(error.error_description || error.error || "Authentication failed");
  }

  return response.json();
}

/**
 * Get user information from user management API
 */
export async function getUserInfo(username: string, accessToken: string): Promise<UserInfo> {
  const userInfoEndpoint = `${AZURE_APIM_BASE}${USER_MANAGEMENT_PATH}/user-management/me/${username}`;

  const response = await fetch(userInfoEndpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "ocp-apim-subscription-key": API_SUBSCRIPTION_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const formData = new URLSearchParams();
  formData.append("client_id", KEYCLOAK_CLIENT_ID);
  formData.append("grant_type", "refresh_token");
  formData.append("refresh_token", refreshToken);

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json();
}

/**
 * Sign out by revoking the token
 */
export async function signOut(refreshToken: string): Promise<void> {
  const logoutEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;

  const formData = new URLSearchParams();
  formData.append("client_id", KEYCLOAK_CLIENT_ID);
  formData.append("refresh_token", refreshToken);

  await fetch(logoutEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });
}

/**
 * Store authentication data in localStorage
 */
export function storeAuthData(tokens: TokenResponse, userInfo: UserInfo): void {
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
  localStorage.setItem("token_expires_at", String(Date.now() + tokens.expires_in * 1000));
  localStorage.setItem("user_info", JSON.stringify(userInfo));
}

/**
 * Get stored authentication data
 */
export function getStoredAuthData(): {
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  isExpired: boolean;
} {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const userInfoStr = localStorage.getItem("user_info");
  const expiresAt = localStorage.getItem("token_expires_at");

  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const isExpired = expiresAt ? Date.now() > parseInt(expiresAt) : true;

  return { accessToken, refreshToken, userInfo, isExpired };
}

/**
 * Clear stored authentication data
 */
export function clearAuthData(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_expires_at");
  localStorage.removeItem("user_info");
}
