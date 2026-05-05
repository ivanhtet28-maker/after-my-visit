import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isDemoMode, enableDemoMode } = useDemoMode();

  useEffect(() => {
    if (!loading && !user && !isDemoMode) enableDemoMode();
  }, [loading, user, isDemoMode, enableDemoMode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
