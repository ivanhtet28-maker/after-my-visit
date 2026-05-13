import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";

const GpLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { enableDemoMode, disableDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    // A real signed-in session takes precedence over any leftover demo flag.
    disableDemoMode();
    // GpProtectedRoute will route them to /gp/onboarding if no practitioner
    // row exists, or /gp/dashboard if onboarding is already complete.
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
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Stethoscope className="h-7 w-7" />
            Clarity Health
          </Link>
          <p className="mt-2 text-muted-foreground">
            Practitioner sign in
          </p>
          <p className="text-xs text-muted-foreground">
            For GPs, physios, psychologists, dietitians, OTs and other clinicians
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
                placeholder="you@clinic.com.au"
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            New to Clarity Health?{" "}
            <Link to="/gp/signup" className="font-medium text-primary hover:underline">
              Create a practitioner account
            </Link>
          </p>

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
            Explore as a demo
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Are you a patient?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Patient sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GpLoginPage;
