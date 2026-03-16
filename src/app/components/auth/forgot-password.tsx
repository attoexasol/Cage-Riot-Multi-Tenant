import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";
import { useAuth } from "./auth-context";

interface ForgotPasswordProps {
  onNavigate: (page: "signin" | "reset-otp") => void;
  onEmailSubmitted: (email: string) => void;
}

export function ForgotPassword({ onNavigate, onEmailSubmitted }: ForgotPasswordProps) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await requestPasswordReset(email);
      
      if (result.success) {
        setSubmitted(true);
        onEmailSubmitted(email);
      } else {
        setError(result.error || "Failed to send reset code");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to
              </p>
              <p className="text-sm font-medium text-foreground mt-1">{email}</p>
            </div>

            <Button
              onClick={() => onNavigate("reset-otp")}
              className="w-full bg-[#ff0050] hover:bg-[#cc0040] text-white"
            >
              Enter Verification Code
            </Button>

            <button
              onClick={() => onNavigate("signin")}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={logo} 
                alt="Cage Riot" 
                className="w-16 h-16 object-contain" 
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to receive a verification code
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Reset Form */}
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
              <p className="text-xs text-muted-foreground">
                We'll send a verification code to this email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#ff0050] hover:bg-[#cc0040] text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Verification Code
                </>
              )}
            </Button>
          </form>

          {/* Back to Sign In */}
          <button
            onClick={() => onNavigate("signin")}
            className="w-full mt-6 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Cage Riot Distribution & Publishing. All rights reserved.
        </p>
      </div>
    </div>
  );
}