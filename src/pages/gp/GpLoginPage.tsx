import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { supabase } from "@/integrations/supabase/client";
import { isGpAdmin } from "@/lib/admins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const GpLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { enableDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isGpAdmin(email)) {
      setLoading(false);
      toast.error("This email is not authorised for the GP portal.");
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Double-check session landed correctly
    const { data: { user } } = await supabase.auth.getUser();
    setLoading(false);

    if (!user || !isGpAdmin(user.email)) {
      toast.error("Sign in failed or account is not authorised for the GP portal.");
      await supabase.auth.signOut();
      return;
    }

    navigate("/gp/dashboard");
  };

  const handleViewDemo = () => {
    enableDemoMode();
    navigate("/gp/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            AfterVisit GP Portal
          </Link>
          <p className="mt-2 text-muted-foreground">
            Sign in to manage your clinic
          </p>
        </div>
        <div className="rounded-xl border bg-card p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="gp-email">Email</Label>
              <Input
                id="gp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="clinic@example.com.au"
              />
            </div>
            <div>
              <Label htmlFor="gp-password">Password</Label>
              <Input
                id="gp-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full min-h-[44px]"
            onClick={handleViewDemo}
          >
            View Demo
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Are you a patient?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Patient login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GpLoginPage;
