import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";
import { useAuth, UserRole } from "./auth-context";

/** Role-based dashboard path after signup (matches App.tsx route by role) */
function getDashboardPathForRole(role: UserRole | undefined): string {
  if (!role) return "/artist/dashboard";
  if (role === "platform-super-admin") return "/super-admin/dashboard";
  if (role === "admin" || role === "organization_admin") return "/admin/dashboard";
  if (role === "operations") return "/operations/dashboard";
  if (role === "legal") return "/legal/dashboard";
  if (role === "finance") return "/finance/dashboard";
  return "/artist/dashboard"; // viewer, account-owner, artist-owner, artist-viewer
}

interface SignUpProps {
  onNavigate: (page: "signin" | "terms-conditions" | "privacy-policy") => void;
  onSuccess: () => void;
}

export function SignUp({ onNavigate, onSuccess }: SignUpProps) {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("account-owner");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordRequirements.every(req => req.met)) {
      setError("Password does not meet all requirements");
      return;
    }

    setLoading(true);

    try {
      const result = await signup(email, password, name, role);

      if (result.success) {
        if (!result.role) {
          setError("Could not determine role. Please sign in again.");
          setLoading(false);
          return;
        }
        onSuccess();
        const path = getDashboardPathForRole(result.role);
        navigate(path, { replace: true });
      } else {
        setError(result.error || "Sign up failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-sm text-muted-foreground">
              Join Cage Riot Distribution & Publishing
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

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

            {/* <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account-owner">Artist / Partner</SelectItem>
                  <SelectItem value="operations">Operations Manager</SelectItem>
                  <SelectItem value="legal">Legal / Compliance</SelectItem>
                  <SelectItem value="finance">Finance / Accounting</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the role that best describes your position
              </p>
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
              
              {/* Password Requirements */}
              {password && (
                <div className="space-y-1 mt-2">
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CheckCircle2
                        className={`h-3 w-3 ${
                          req.met ? "text-green-500" : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={req.met ? "text-green-500" : "text-muted-foreground"}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input type="checkbox" required className="mt-1 rounded border-border cursor-pointer" disabled={loading} />
              <span className="text-muted-foreground">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("terms-conditions")}
                  className="text-[#ff0050] hover:underline cursor-pointer"
                  disabled={loading}
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("privacy-policy")}
                  className="text-[#ff0050] hover:underline cursor-pointer"
                  disabled={loading}
                >
                  Privacy Policy
                </button>
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#ff0050] hover:bg-[#cc0040] text-white cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => onNavigate("signin")}
              className="text-[#ff0050] hover:underline font-medium cursor-pointer"
              disabled={loading}
            >
              Sign in
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