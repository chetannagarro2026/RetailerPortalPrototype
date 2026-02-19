import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthState {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
  /** Show the sign-in modal (for gating flows) */
  showSignInModal: (message?: string) => void;
  hideSignInModal: () => void;
  signInModalVisible: boolean;
  signInModalMessage: string;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [signInModalVisible, setSignInModalVisible] = useState(false);
  const [signInModalMessage, setSignInModalMessage] = useState("");

  const signIn = useCallback(() => {
    setIsAuthenticated(true);
    setSignInModalVisible(false);
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
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
