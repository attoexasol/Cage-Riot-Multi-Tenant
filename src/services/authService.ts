import { API_BASE_URL } from "@/config/env";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
  organization_id: number;
  organization_parent_id: number | null;
  organization_name?: string;
  role_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  access_token: string;
  token_type: string;
  organization_id: number;
  organization_name?: string;
  role_name?: string;
  user_role?: string;
  role?: string;
  expires_in?: number;
}

/**
 * Register a new user. On success, returns access_token and related data.
 * Caller is responsible for storing the token and decoding it for role/navigation.
 */
export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      (body as { message?: string }).message ||
      (body as { error?: string }).error ||
      `Registration failed (${response.status})`;
    throw new Error(message);
  }

  const result = (await response.json()) as RegisterResponse;
  if (!result.access_token) {
    throw new Error("Token not received");
  }
  return result;
}

/**
 * Login user. On success, returns access_token, user_role, organization_id.
 * Caller should store the token and use decodeToken / getRoleFromToken for navigation.
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (body as { message?: string }).message ||
      (body as { error?: string }).error ||
      `Login failed (${response.status})`;
    throw new Error(message);
  }

  const result = body as LoginResponse;
  if (!result.access_token) {
    throw new Error("Token not received");
  }
  return result;
}

/** Response from POST /api/send-otp */
export interface SendOtpResponse {
  status: string;
  message: string;
  data: {
    otp: number;
    user: {
      id: number;
      name: string;
      email: string;
      email_verified_at: string | null;
      created_at: string;
      updated_at: string;
      otp: number;
      otp_expires_at: string | null;
      updated_by: number;
    };
  };
}

/**
 * Send OTP to the given email for password reset.
 * POST /api/send-otp with body { email }.
 */
export async function sendOtp(email: string): Promise<SendOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const body = (await response.json().catch(() => ({}))) as SendOtpResponse & { message?: string };

  if (!response.ok) {
    const message =
      body.message || (body as { error?: string }).error || `Failed to send verification code (${response.status})`;
    throw new Error(message);
  }

  if (body.status !== "success") {
    throw new Error(body.message || "Failed to send verification code");
  }

  return body;
}

/** Response from POST /api/verify-otp */
export interface VerifyOtpResponse {
  status: string;
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    otp: number;
    otp_expires_at: string | null;
    updated_by: number;
  };
}

/**
 * Verify OTP for password reset.
 * POST /api/verify-otp with body { email, otp } (otp as string).
 */
export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp: String(otp).trim() }),
  });

  const body = (await response.json().catch(() => ({}))) as VerifyOtpResponse & { message?: string };

  if (!response.ok) {
    const message =
      body.message || (body as { error?: string }).error || `OTP verification failed (${response.status})`;
    throw new Error(message);
  }

  if (body.status !== "success") {
    throw new Error(body.message || "Invalid or expired OTP code");
  }

  return body;
}
