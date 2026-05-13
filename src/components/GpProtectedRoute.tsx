import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { usePractitioner } from "@/hooks/usePractitioner";

interface GpProtectedRouteProps {
  children: React.ReactNode;
  // Set to false on the onboarding page itself, so a logged-in user
  // without a practitioner row can reach it.
  requirePractitioner?: boolean;
}

const GpProtectedRoute = ({
  children,
  requirePractitioner = true,
}: GpProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { practitioner, loading: practitionerLoading } = usePractitioner();

  if (authLoading || practitionerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Auth wins over demo: if a real user is signed in, they get the real flow
  // even if demo mode is left on in localStorage from a previous session.
  // Demo mode only takes effect for unauthenticated visitors.
  if (!user) {
    if (isDemoMode) return <>{children}</>;
    return <Navigate to="/gp/login" replace />;
  }

  // Signed in but no practitioner row → onboarding required.
  if (requirePractitioner && !practitioner) {
    return <Navigate to="/gp/onboarding" replace />;
  }

  return <>{children}</>;
};

export default GpProtectedRoute;
