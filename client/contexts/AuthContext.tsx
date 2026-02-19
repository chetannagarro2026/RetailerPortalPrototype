import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Minimal stub AuthContext after removing Keycloak integration.
// Keeps the app working by providing a simple client-side auth state.

type AuthContextType = {
  initialized: boolean;
  authenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  token: string | null;
  user: any | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  const login = async () => {
    // For now, simulate a successful login (no Keycloak).
    setAuthenticated(true);
    setToken('local-fake-token');
    setUser({ username: 'local.user' });
    return Promise.resolve();
  };

  const loginWithCredentials = async (username: string) => {
    // Accept any credentials for local dev; set a fake token.
    setAuthenticated(true);
    setToken('local-fake-token');
    setUser({ username });
    return Promise.resolve();
  };

  const logout = async () => {
    setAuthenticated(false);
    setToken(null);
    setUser(null);
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ initialized: true, authenticated, login, logout, loginWithCredentials, token, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
