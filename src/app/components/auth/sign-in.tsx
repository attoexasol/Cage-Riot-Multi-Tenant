import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";
import { useAuth, UserRole } from "./auth-context";

/** Role-based dashboard path after login (matches App.tsx route by role) */
function getDashboardPathForRole(role: UserRole | undefined): string {
  if (!role) return "/artist/dashboard";
  if (role === "platform-super-admin") return "/super-admin/dashboard";
  if (role === "admin" || role === "organization_admin") return "/admin/dashboard";
  if (role === "operations") return "/operations/dashboard";
  if (role === "legal") return "/legal/dashboard";
  if (role === "finance") return "/finance/dashboard";
  return "/artist/dashboard"; // viewer, account-owner, artist-owner, artist-viewer
}

interface SignInProps {
  onNavigate: (page: "signup" | "forgot-password") => void;
  onSuccess: () => void;
}

export function SignIn({ onNavigate, onSuccess }: SignInProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        if (!result.role) {
          setError("Could not determine role. Please try again.");
          setLoading(false);
          return;
        }
        onSuccess();
        const path = getDashboardPathForRole(result.role);
        navigate(path, { replace: true });
      } else {
        setError(result.error ?? "Login failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-[15px] sm:p-[32px]">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={logo} 
                alt="Cage Riot" 
                className="w-16 h-16 object-contain" 
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to Cage Riot Distribution & Publishing
            </p>
          </div>

          {/* Demo Credentials */}
          {/* <div className="mb-6 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <div><span className="font-medium text-purple-600">Platform Super Admin:</span> superadmin@cageriot.com / super123</div>
              <div className="border-t border-border/50 my-1.5 pt-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground/70 mb-1">ENTERPRISE ACCOUNT:</p>
              </div>
              <div><span className="font-medium text-blue-600">Account Admin:</span> admin@cageriot.com / admin123</div>
              <div><span className="font-medium text-orange-600">Operations:</span> ops@cageriot.com / ops123</div>
              <div><span className="font-medium text-indigo-600">Legal:</span> legal@cageriot.com / legal123</div>
              <div><span className="font-medium text-green-600">Finance:</span> finance@cageriot.com / finance123</div>
              <div><span className="font-medium text-[#ff0050]">Artist Owner:</span> artist@cageriot.com / artist123</div>
              <div><span className="font-medium text-slate-600">Artist Viewer:</span> artistviewer@cageriot.com / viewer123</div>
              <div className="border-t border-border/50 my-1.5 pt-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground/70 mb-1">STANDARD ACCOUNT:</p>
              </div>
              <div><span className="font-medium text-[#ff0050]">Account Owner:</span> standard@cageriot.com / standard123</div>
              <div><span className="font-medium text-slate-600">Viewer:</span> standardviewer@cageriot.com / viewer123</div>
            </div>
          </div> */}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border cursor-pointer" />
                <span className="text-muted-foreground text-xs sm:text-sm">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate("forgot-password")}
                className="text-[#ff0050] hover:underline text-xs sm:text-sm cursor-pointer"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#ff0050] hover:bg-[#cc0040] text-white cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={() => onNavigate("signup")}
              className="text-[#ff0050] hover:underline font-medium cursor-pointer"
              disabled={loading}
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Cage Riot Distribution & Publishing. All rights reserved.
        </p>
      </div>
    </div>
  );
}