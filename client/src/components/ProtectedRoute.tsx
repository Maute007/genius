import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { api } from "@/lib/api";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = "/login",
  requireOnboarding = false 
}: ProtectedRouteProps) {
  const { user, loading, login } = useGeniusAuth();
  const [, setLocation] = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(requireOnboarding);

  useEffect(() => {
    if (!loading && !user) {
      setLocation(redirectTo);
    }
  }, [loading, user, redirectTo, setLocation]);

  useEffect(() => {
    async function checkOnboarding() {
      if (!requireOnboarding || !user || loading) return;
      
      if (user.onboardingCompleted) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const profile = await api.profile.get();
        
        if (profile?.onboardingCompleted) {
          const updatedUser = {
            ...user,
            name: profile.fullName || user.name,
            age: profile.age || undefined,
            grade: profile.grade || undefined,
            interests: profile.interests?.join(", ") || undefined,
            province: profile.province || undefined,
            onboardingCompleted: true,
          };
          const token = localStorage.getItem("genius_token") || "local-token";
          login(updatedUser, token);
          setCheckingOnboarding(false);
        } else {
          setLocation("/onboarding");
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
        setLocation("/onboarding");
      }
    }

    if (user && !loading) {
      checkOnboarding();
    }
  }, [user, loading, requireOnboarding, login, setLocation]);

  if (loading || !user || (requireOnboarding && checkingOnboarding)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">A verificar autenticação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children, redirectTo = "/" }: ProtectedRouteProps) {
  const { user, loading } = useGeniusAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      setLocation(redirectTo);
    }
  }, [loading, user, redirectTo, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
