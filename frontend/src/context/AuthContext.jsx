import { useCallback, useEffect, useMemo, useState } from "react";
import { AUTH_LOGOUT_EVENT, AUTH_STORAGE_KEY, getStoredAuth } from "../services/api";
import { getProfile } from "../services/userService";
import { AuthContext } from "./contexts";

export function AuthProvider({ children }) {
  // Read synchronously so protected routes don't redirect before auth loads.
  const [auth, setAuth] = useState(getStoredAuth);

  const login = useCallback((token, user) => {
    const next = { token, user };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_LOGOUT_EVENT, logout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, logout);
  }, [logout]);

  // Validate a stored token once on load (logs out via the 401 interceptor if expired).
  const hasToken = Boolean(auth?.token);
  useEffect(() => {
    if (!hasToken) return;
    getProfile()
      .then((res) => {
        const stored = getStoredAuth();
        if (stored?.token) login(stored.token, res.data.data);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      isAuthenticated: Boolean(auth?.token),
      login,
      logout,
    }),
    [auth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
