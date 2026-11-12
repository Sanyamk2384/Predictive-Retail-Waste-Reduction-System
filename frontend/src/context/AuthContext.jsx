import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getToken, setToken, clearToken, registerUnauthorizedHandler } from "../api/client.js";
import { loginAccount, registerAccount, fetchCurrentUser } from "../api/auth.js";

const AuthContext = createContext(null);

// TEMPORARY DEMO BYPASS — on by default. Set env VITE_AUTH_BYPASS=false (then rebuild) to re-enable login.
// While on, the app treats everyone as a signed-in demo user.
const AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS !== "false";
const DEMO_USER = {
  name: "Demo User",
  email: "demo@example.com",
  role: "admin",
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(AUTH_BYPASS ? DEMO_USER : null);
  const [initializing, setInitializing] = useState(!AUTH_BYPASS);

  const logout = useCallback(() => {
    clearToken();
    setUser(AUTH_BYPASS ? DEMO_USER : null);
  }, []);

  useEffect(() => {
    if (AUTH_BYPASS) return;
    registerUnauthorizedHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    if (AUTH_BYPASS) return;
    const token = getToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    fetchCurrentUser()
      .then((fetchedUser) => setUser(fetchedUser))
      .catch(() => clearToken())
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (payload) => {
    const { user: loggedInUser, token } = await loginAccount(payload);
    setToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: newUser, token } = await registerAccount(payload);
    setToken(token);
    setUser(newUser);
    return newUser;
  }, []);

  const value = useMemo(
    () => ({ user, initializing, isAuthenticated: Boolean(user), login, register, logout }),
    [user, initializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
