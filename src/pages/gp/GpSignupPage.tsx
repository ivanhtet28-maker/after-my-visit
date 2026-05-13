import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Stethoscope, Loader2 } from "lucide-react";

const GpSignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const { disableDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);

    const { error: signUpError } = await signUp(email, password);
    if (signUpError) {
      setLoading(false);
      toast.error(signUpError.message);
      return;
    }

    // Auto sign-in. If email confirmation is required, this fails — we tell
    // the user to check their inbox.
    const { error: signInError } = await signIn(email, password);
    setLoading(false);

    if (signInError) {
      toast.success("Account created", {
        description: "Check your email to confirm, then sign in.",
      });
      navigate("/gp/login");
      return;
    }

    disableDemoMode();
    // GpProtectedRoute will see no practitioner row and route to onboarding.
    navigate("/gp/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Stethoscope className="h-7 w-7" />
            Clarity Health
          </Link>
          <p className="mt-2 text-muted-foreground">Create a practitioner account</p>
          <p className="text-xs text-muted-foreground">
            For GPs, physios, psychologists, dietitians, OTs and other clinicians
          </p>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@clinic.com.au"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/gp/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            We'll ask for your AHPRA registration on the next step. Your AHPRA
            number is verified manually before patients see "verified" on your
            summaries.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GpSignupPage;
