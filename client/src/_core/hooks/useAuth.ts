import { useCallback, useMemo, useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("genius_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("genius_user");
      }
    }
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("genius_token");
    localStorage.removeItem("genius_user");
    setUser(null);
  }, []);

  const login = useCallback((userData: User, token: string) => {
    localStorage.setItem("genius_token", token);
    localStorage.setItem("genius_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const state = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
  }), [user, loading]);

  return {
    ...state,
    logout,
    login,
    refresh: () => {
      const stored = localStorage.getItem("genius_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem("genius_user");
        }
      }
    },
  };
}
