import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useGeniusAuth } from "@/_core/hooks/useGeniusAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Blocks access to pages that require authentication
 * Instantly redirects unauthenticated users - NO DELAY
 */
export function ProtectedRoute({ children, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, loading } = useGeniusAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Fast check: if not loading and no user, redirect immediately
    if (!loading && !user) {
      setLocation(redirectTo);
    }
  }, [loading, user, redirectTo, setLocation]);

  // Show nothing while checking auth or redirecting
  // This prevents flash of protected content
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">A verificar autenticação...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, show protected content
  return <>{children}</>;
}

/**
 * Public Only Route Component
 * Redirects authenticated users away from login/register pages
 */
export function PublicOnlyRoute({ children, redirectTo = "/" }: ProtectedRouteProps) {
  const { user, loading } = useGeniusAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If user is logged in, redirect away from public pages
    if (!loading && user) {
      setLocation(redirectTo);
    }
  }, [loading, user, redirectTo, setLocation]);

  // Show loading while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user exists, don't show content (will redirect)
  if (user) {
    return null;
  }

  // User not authenticated, show public content
  return <>{children}</>;
}
