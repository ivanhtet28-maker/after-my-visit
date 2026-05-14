import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, User } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [portal, setPortal] = useState<"patient" | "doctor">("patient");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      localStorage.setItem("clarity_portal", portal);
      if (inviteToken && portal === "patient") {
        navigate(`/care/${encodeURIComponent(inviteToken)}`);
      } else {
        navigate(portal === "doctor" ? "/gp/dashboard" : "/dashboard");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-primary">Clarity Health</Link>
          <p className="mt-2 text-muted-foreground">
            {portal === "doctor" ? "Doctor Portal" : "Welcome back"}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-8 shadow-card">
          <Tabs value={portal} onValueChange={(v) => setPortal(v as "patient" | "doctor")} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient" className="gap-2">
                <User className="h-4 w-4" />
                Patient
              </TabsTrigger>
              <TabsTrigger value="doctor" className="gap-2">
                <Stethoscope className="h-4 w-4" />
                Doctor
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : portal === "doctor" ? "Sign In to Doctor Portal" : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to={inviteToken ? `/signup?invite=${encodeURIComponent(inviteToken)}` : "/signup"}
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
