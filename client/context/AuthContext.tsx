import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  signInWithCredentials,
  getUserInfo,
  signOut as authSignOut,
  storeAuthData,
  getStoredAuthData,
  clearAuthData,
  refreshAccessToken,
  type UserInfo,
} from "../services/authService";

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Show the sign-in modal (for gating flows) */
  showSignInModal: (message?: string) => void;
  hideSignInModal: () => void;
  signInModalVisible: boolean;
  signInModalMessage: string;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signInModalVisible, setSignInModalVisible] = useState(false);
  const [signInModalMessage, setSignInModalMessage] = useState("");

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = getStoredAuthData();
        
        // If no tokens found, user is not authenticated
        if (!stored.accessToken || !stored.userInfo) {
          setIsLoading(false);
          return;
        }

        // If access token is valid, restore session
        if (!stored.isExpired) {
          setAccessToken(stored.accessToken);
          setUser(stored.userInfo);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // If access token expired but refresh token exists, try to refresh
        if (stored.refreshToken) {
          try {
            const newTokens = await refreshAccessToken(stored.refreshToken);
            storeAuthData(newTokens, stored.userInfo);
            setAccessToken(newTokens.access_token);
            setUser(stored.userInfo);
            setIsAuthenticated(true);
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            clearAuthData();
          }
        } else {
          // No refresh token available, clear auth
          clearAuthData();
        }
      } catch (error) {
        console.error("Failed to restore auth session:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Refresh token 5 minutes before expiry
    const stored = getStoredAuthData();
    const expiresAt = localStorage.getItem("token_expires_at");
    
    if (!expiresAt || !stored.refreshToken) return;

    const expiryTime = parseInt(expiresAt);
    const refreshTime = expiryTime - 5 * 60 * 1000; // 5 minutes before
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh <= 0) {
      // Token should be refreshed immediately
      refreshAccessToken(stored.refreshToken)
        .then((newTokens) => {
          storeAuthData(newTokens, user!);
          setAccessToken(newTokens.access_token);
        })
        .catch((error) => {
          console.error("Failed to refresh token:", error);
          // Log out on refresh failure
          clearAuthData();
          setAccessToken(null);
          setUser(null);
          setIsAuthenticated(false);
        });
      return;
    }

    // Set timeout to refresh token before expiry
    const refreshTimer = setTimeout(() => {
      const currentStored = getStoredAuthData();
      if (currentStored.refreshToken) {
        refreshAccessToken(currentStored.refreshToken)
          .then((newTokens) => {
            storeAuthData(newTokens, user!);
            setAccessToken(newTokens.access_token);
          })
          .catch((error) => {
            console.error("Failed to refresh token:", error);
            // Log out on refresh failure
            clearAuthData();
            setAccessToken(null);
            setUser(null);
            setIsAuthenticated(false);
          });
      }
    }, timeUntilRefresh);

    return () => clearTimeout(refreshTimer);
  }, [isAuthenticated, accessToken, user]);

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      // Step 1: Authenticate with Keycloak
      const tokens = await signInWithCredentials(username, password);

      // Step 2: Get user info from user management API
      const userInfo = await getUserInfo(username, tokens.access_token);

      // Step 3: Store tokens and user info
      storeAuthData(tokens, userInfo);
      setAccessToken(tokens.access_token);
      setUser(userInfo);
      setIsAuthenticated(true);
      setSignInModalVisible(false);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const stored = getStoredAuthData();
      if (stored.refreshToken) {
        await authSignOut(stored.refreshToken);
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      clearAuthData();
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const showSignInModal = useCallback((message?: string) => {
    setSignInModalMessage(message || "");
    setSignInModalVisible(true);
  }, []);

  const hideSignInModal = useCallback(() => {
    setSignInModalVisible(false);
    setSignInModalMessage("");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        isLoading,
        signIn,
        signOut,
        showSignInModal,
        hideSignInModal,
        signInModalVisible,
        signInModalMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
