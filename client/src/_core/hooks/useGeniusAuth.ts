import { useCallback, useEffect, useMemo, useState } from "react";

export interface GeniusUser {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin" | "super_admin";
  plan?: "free" | "student" | "student_plus" | "family";
}

// Fast sync check - no async needed for localStorage
function getStoredUser(): GeniusUser | null {
  try {
    const token = localStorage.getItem("genius_token");
    const userStr = localStorage.getItem("genius_user");
    
    if (!token || !userStr) return null;
    
    return JSON.parse(userStr);
  } catch {
    // If parsing fails, clear invalid data
    localStorage.removeItem("genius_token");
    localStorage.removeItem("genius_user");
    return null;
  }
}

export function useGeniusAuth() {
  // Initialize with stored user immediately - NO DELAY
  const [user, setUser] = useState<GeniusUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState(false); // Start as false since we check sync

  // Re-check on mount (in case storage changed)
  useEffect(() => {
    const storedUser = getStoredUser();
    if (JSON.stringify(storedUser) !== JSON.stringify(user)) {
      setUser(storedUser);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("genius_token");
    localStorage.removeItem("genius_user");
    setUser(null);
    window.location.href = "/";
  }, []);

  const login = useCallback((userData: GeniusUser, token: string) => {
    localStorage.setItem("genius_token", token);
    localStorage.setItem("genius_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const state = useMemo(() => ({
    user,
    loading,
    error: null,
    isAuthenticated: Boolean(user),
  }), [user, loading]);

  return {
    ...state,
    logout,
    login,
  };
}

export function getLoginUrl() {
  return "/login";
}

