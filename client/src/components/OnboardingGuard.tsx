import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";
import { api } from "@/lib/api";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isAuthenticated, loading, login } = useGeniusAuth();
  const [, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      if (loading) return;
      
      if (!isAuthenticated || !user) {
        setLocation("/login");
        return;
      }

      if (user.onboardingCompleted) {
        setChecking(false);
        return;
      }

      try {
        const userId = parseInt(user.id, 10);
        const profile = await api.profiles.get(userId);
        
        if (profile.onboardingCompleted) {
          const updatedUser = {
            ...user,
            name: profile.name || user.name,
            age: profile.age || undefined,
            grade: profile.grade || undefined,
            interests: profile.interests || undefined,
            province: profile.province || undefined,
            onboardingCompleted: true,
          };
          const token = localStorage.getItem("genius_token") || "local-token";
          login(updatedUser, token);
          setChecking(false);
        } else {
          setLocation("/onboarding");
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
        setLocation("/onboarding");
      }
    }

    checkOnboarding();
  }, [user, isAuthenticated, loading, setLocation, login]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
