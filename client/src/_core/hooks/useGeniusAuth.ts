import { useCallback, useEffect, useMemo, useState } from "react";

export interface GeniusUser {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin" | "super_admin";
  plan?: "free" | "student" | "student_plus" | "family";
  onboardingCompleted?: boolean;
  age?: number;
  grade?: string;
  interests?: string;
  province?: string;
}

function getStoredUser(): GeniusUser | null {
  try {
    const token = localStorage.getItem("genius_token");
    const userStr = localStorage.getItem("genius_user");
    
    if (!token || !userStr) return null;
    
    return JSON.parse(userStr);
  } catch {
    localStorage.removeItem("genius_token");
    localStorage.removeItem("genius_user");
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("genius_token");
  localStorage.removeItem("genius_user");
}

export function useGeniusAuth() {
  const [user, setUser] = useState<GeniusUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    async function validateSession() {
      const token = localStorage.getItem("genius_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { api } = await import("@/lib/api");
        const response = await api.auth.validate();
        
        if (response.valid) {
          const updatedUser = {
            ...response.user,
            onboardingCompleted: response.user.onboardingCompleted,
          };
          localStorage.setItem("genius_user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        } else {
          clearSession();
          setUser(null);
        }
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setLoading(false);
        setValidated(true);
      }
    }

    if (!validated) {
      validateSession();
    }
  }, [validated]);

  const logout = useCallback(async () => {
    try {
      const { api } = await import("@/lib/api");
      await api.auth.logout();
    } catch {}
    clearSession();
    setUser(null);
    window.location.href = "/";
  }, []);

  const login = useCallback((userData: GeniusUser, token: string) => {
    localStorage.setItem("genius_token", token);
    localStorage.setItem("genius_user", JSON.stringify(userData));
    setUser(userData);
    setValidated(true);
  }, []);

  const refreshAuth = useCallback(async () => {
    const token = localStorage.getItem("genius_token");
    if (!token) return;

    try {
      const { api } = await import("@/lib/api");
      const response = await api.auth.validate();
      
      if (response.valid) {
        const updatedUser = {
          ...response.user,
          onboardingCompleted: response.user.onboardingCompleted,
        };
        localStorage.setItem("genius_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch {}
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
    refreshAuth,
  };
}

export function getLoginUrl() {
  return "/login";
}

