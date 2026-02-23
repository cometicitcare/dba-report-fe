/**
 * AuthContext — Manages authentication state for the entire app.
 *
 * Flow:
 *  1. On mount: check sessionStorage for a saved token, verify it with /auth/me.
 *  2. login(username, password) → calls backend, stores token, sets user.
 *  3. logout() → clears token, resets state.
 *  4. All other pages check `isAuthenticated` — if false, they never render.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);         // { username }
  const [isAuthenticated, setIsAuth]  = useState(false);
  const [isLoading, setIsLoading]     = useState(true);         // true while verifying stored token

  // ── On mount: restore session if token exists ─────────────────
  useEffect(() => {
    const verifyStoredToken = async () => {
      if (!tokenStorage.exists()) {
        setIsLoading(false);
        return;
      }
      try {
        const info = await authApi.me();
        setUser({ username: info.username });
        setIsAuth(true);
      } catch {
        // Token invalid/expired
        tokenStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    verifyStoredToken();
  }, []);

  // ── login ─────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const data = await authApi.login(username, password);
    tokenStorage.set(data.access_token);
    setUser({ username });
    setIsAuth(true);
    return data;
  }, []);

  // ── logout ────────────────────────────────────────────────────
  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setIsAuth(false);
  }, []);

  const value = { isAuthenticated, isLoading, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to consume auth context. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
