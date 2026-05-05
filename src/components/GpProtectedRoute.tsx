import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { isGpAdmin } from "@/lib/admins";

const GpProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemoMode();

  if (isDemoMode) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isGpAdmin(user.email)) {
    return <Navigate to="/gp/login" replace />;
  }

  return <>{children}</>;
};

export default GpProtectedRoute;
