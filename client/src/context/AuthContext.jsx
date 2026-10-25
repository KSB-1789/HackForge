import { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken } from "../api/p1Api";

const AuthContext = createContext();

const TOKEN_KEY = "hackforge_token";
const USER_KEY = "hackforge_user";

function getRequestErrorMessage(err, fallback) {
  const serverMessage = err.response?.data?.message;
  if (serverMessage) return serverMessage;

  if (err.response) return `${fallback} Please try again.`;

  return "Unable to reach the API server. Check that the backend is running and try again.";
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    } else {
      setAuthToken(null);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, token: newToken } = res.data.data;
      setCurrentUser(user);
      setTokenState(newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, newToken);
      setAuthToken(newToken);
      return { success: true };
    } catch (err) {
      const message = getRequestErrorMessage(err, "Login failed.");
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      return { success: true, user: res.data.data.user };
    } catch (err) {
      const message = getRequestErrorMessage(err, "Registration failed.");
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setTokenState(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}