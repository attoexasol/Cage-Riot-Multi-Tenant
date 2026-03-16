import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";
import { useAuth } from "./auth-context";

interface OTPVerificationProps {
  onNavigate: (page: "signin") => void;
  onSuccess: () => void;
  mode: "login" | "reset";
  email?: string;
  onResetVerified?: () => void;
}

export function OTPVerification({ onNavigate, onSuccess, mode, email, onResetVerified }: OTPVerificationProps) {
  const { verifyOTP, verifyResetOTP } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value && newOtp.every(digit => digit !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);

    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code: string) => {
    setError("");
    setLoading(true);

    try {
      let result;
      
      if (mode === "login") {
        result = await verifyOTP(code);
      } else {
        result = await verifyResetOTP(email || "", code);
      }
      
      if (result.success) {
        if (mode === "login") {
          onSuccess();
        } else {
          onResetVerified?.();
        }
      } else {
        setError(result.error || "Invalid verification code");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      handleVerify(code);
    } else {
      setError("Please enter all 6 digits");
    }
  };

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
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {mode === "login" ? "Two-Factor Authentication" : "Verify Your Email"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" 
                ? "Enter the 6-digit code from your authenticator app"
                : `Enter the code we sent to ${email}`
              }
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  className="w-12 h-14 text-center text-2xl font-semibold rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors disabled:opacity-50"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#ff0050] hover:bg-[#cc0040] text-white"
              disabled={loading || otp.some(digit => digit === "")}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={() => {
                setError("");
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
              }}
              className="text-sm text-[#ff0050] hover:underline font-medium"
              disabled={loading}
            >
              Resend Code
            </button>
          </div>

          {/* Back Button */}
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