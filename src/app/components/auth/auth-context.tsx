import { registerUser, loginUser, sendOtp, verifyOtp, changePassword } from "@/services/authService";
import { SESSION_EXPIRED_EVENT } from "@/services/sessionEvents";
import { persistAuthTokens, clearAuthTokens } from "@/services/tokenStorage";
import { decodeToken, getRoleFromToken } from "@/utils/decodeToken";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export type UserRole =
  | "platform-super-admin"
  | "admin"
  | "organization_admin"
  | "operations"
  | "legal"
  | "finance"
  | "artist-owner"
  | "artist-viewer"
  | "account-owner"
  | "viewer";

export type AccountType = "standard" | "enterprise";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  accountType: AccountType;  
  accountId: string;
  organizationName?: string;
  /** Display label from API (e.g. role_name: "standard_owner") for header badge */
  roleName?: string;
  artistId?: string; // Only for artist-level users in enterprise accounts
  twoFactorEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  verifyOTP: (code: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyResetOTP: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Map API JWT role (e.g. enterprise_ops, standard_viewer) to app UserRole for dashboard routing */
function mapApiRoleToUserRole(apiRole: string): UserRole {
  const role = (apiRole || "").toLowerCase().trim();
  switch (role) {
    case "standard_viewer":
      return "viewer";
    case "admin":
    case "enterprise_admin":
      return "admin";
    case "organization_admin":
      return "organization_admin";
    case "enterprise_ops":
      return "operations";
    case "operations":
      return "operations";
    case "enterprise_legal":
    case "enterprise-legal":
    case "legal":
      return "legal";
    case "enterprise_finance":
    case "enterprise-finance":
    case "finance":
      return "finance";
    case "platform_admin":
    case "platform_super_admin":
    case "platform-super-admin":
      return "platform-super-admin";
    case "artist_owner":
    case "artist-owner":
      return "artist-owner";
    case "artist_viewer":
    case "artist-viewer":
      return "artist-viewer";
    case "account_owner":
    case "account-owner":
    case "standard_owner":
      return "account-owner";
    default:
      return "viewer";
  }
}

// Mock users database (in production, this would be in your backend)
// const mockUsers = [
//   {
//     id: "1",
//     email: "superadmin@cageriot.com",
//     password: "super123",
//     name: "Platform Super Admin",
//     role: "platform-super-admin" as UserRole,
//     accountType: "enterprise" as AccountType,
//     accountId: "platform-001",
//     twoFactorEnabled: false,
//   },
//   {
//     id: "2",
//     email: "admin@cageriot.com",
//     password: "admin123",
//     name: "Enterprise Admin",
//     role: "admin" as UserRole,
//     accountType: "enterprise" as AccountType,
//     accountId: "ent-001",
//     twoFactorEnabled: false,
//   },
//   {
//     id: "3",
//     email: "ops@cageriot.com",
//     password: "ops123",
//     name: "Operations Manager",
//     role: "operations" as UserRole,
//     accountType: "enterprise" as AccountType,
//     accountId: "ent-001",
//     twoFactorEnabled: false,
//   },
//   {
//     id: "4",
//     email: "legal@cageriot.com",
//     password: "legal123",
//     name: "Legal Counsel",
//     role: "legal" as UserRole,
//     accountType: "enterprise" as AccountType,
//     accountId: "ent-001",
//     twoFactorEnabled: false,
//   },
//   {
//     id: "5",
//     email: "finance@cageriot.com",
//     password: "finance123",
//     name: "Finance Director",
//     role: "finance" as UserRole,
//     accountType: "enterprise" as AccountType,
//     accountId: "ent-001",
//     twoFactorEnabled: false,
//   },
//   {
//     id: "6",
//     email: "artist@cageriot.com",
//     password: "artist123",
//     name: "The Waves",
//     role: "artist-owner" as UserRole,
//     accountType: "enterprise" as AccountType,
//     accountId: "ent-001",
//     artistId: "artist-001",
//     twoFactorEnabled: false,
//   },
//   {
//     id: "7",
//     email: "artistviewer@cageriot.com",
//     password: "viewer123",
//     name: "Artist Collaborator",
//     role: "artist-viewer" as UserRole,
//     accountType: "enterprise" as AccountType,
//     accountId: "ent-001",
//     artistId: "artist-001",
//     twoFactorEnabled: false,
//   },
//   {
//     id: "8",
//     email: "standard@cageriot.com",
//     password: "standard123",
//     name: "Independent Artist",
//     role: "account-owner" as UserRole,
//     accountType: "standard" as AccountType,
//     accountId: "std-001",
//     twoFactorEnabled: false,
//   },
//   {
//     id: "9",
//     email: "standardviewer@cageriot.com",
//     password: "viewer123",
//     name: "Standard Viewer",
//     role: "viewer" as UserRole,
//     accountType: "standard" as AccountType,
//     accountId: "std-001",
//     twoFactorEnabled: false,
//   },
// ];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored auth on mount
    // const storedUser = localStorage.getItem("auth_user");
    const storedUser = localStorage.getItem("auth_user");
    const token = localStorage.getItem("access_token");
    
    if (storedUser && token) {
      const parsed = JSON.parse(storedUser) as User;
      const storedOrgName = localStorage.getItem("organization_name");
      const storedUserRole = localStorage.getItem("user_role");
      if (storedOrgName && !parsed.organizationName) {
        parsed.organizationName = storedOrgName;
      }
      if (storedUserRole && !parsed.roleName) {
        parsed.roleName = storedUserRole;
      }
      setUser(parsed);
    }
  }, []);

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      setPendingUser(null);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("organization_id");
      localStorage.removeItem("organization_name");
      localStorage.removeItem("user_role");
      navigate("/signin", { replace: true });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [navigate]);

  // const login = async (email: string, password: string) => {
  //   // Simulate API call
  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   const foundUser = mockUsers.find(
  //     u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  //   );

  //   if (!foundUser) {
  //     return { success: false, error: "Invalid email or password" };
  //   }

  //   const userData: User = {
  //     id: foundUser.id,
  //     email: foundUser.email,
  //     name: foundUser.name,
  //     role: foundUser.role,
  //     accountType: foundUser.accountType,
  //     accountId: foundUser.accountId,
  //     artistId: foundUser.artistId,
  //     twoFactorEnabled: foundUser.twoFactorEnabled,
  //   };

  //   // Direct login for all users (no OTP)
  //   setUser(userData);
  //   localStorage.setItem("auth_user", JSON.stringify(userData));
  //   return { success: true };
  // };

  const verifyOTP = async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (code === "123456" && pendingUser) {
      setUser(pendingUser);
      localStorage.setItem("auth_user", JSON.stringify(pendingUser));
      setPendingUser(null);
      return { success: true };
    }
    return { success: false, error: "Invalid OTP code" };
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    try {
      const response = await loginUser({ email, password });
      const token = response.access_token;

      if (!token) {
        return { success: false, error: "Token not received" };
      }

      persistAuthTokens({
        access_token: token,
        refresh_token: response.refresh_token,
        expires_in: response.expires_in ?? 3600,
      });
      if (response.organization_id != null) {
        localStorage.setItem("organization_id", String(response.organization_id));
      }
      // Support both snake_case and camelCase from API
      const apiUserRole = response.user_role ?? (response as { userRole?: string }).userRole;
      const apiRoleName = response.role_name ?? (response as { roleName?: string }).roleName;
      const apiOrgName = response.organization_name ?? (response as { organizationName?: string }).organizationName;
      if (apiUserRole) {
        localStorage.setItem("user_role", apiUserRole);
      }
      if (apiOrgName) {
        localStorage.setItem("organization_name", apiOrgName);
      }

      const decoded = decodeToken(token);
      const apiRole =
        apiUserRole ?? response.role ?? getRoleFromToken(token);
      const mappedRole = mapApiRoleToUserRole(apiRole);
      // Use role_name first, then user_role (response role for display)
      const displayRoleName = apiRoleName ?? apiUserRole;

      const userData: User = {
        id: decoded.sub,
        email,
        name: email, // API login does not return name; use email until profile is loaded
        role: mappedRole,
        accountType: (decoded.org_type === "standard" ? "standard" : "enterprise") as AccountType,
        accountId: String(decoded.organization_id ?? response.organization_id),
        organizationName: apiOrgName,
        roleName: displayRoleName,
        twoFactorEnabled: false,
      };

      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      return { success: true, role: mappedRole };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      return { success: false, error: message };
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    _role: UserRole
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    try {
      const response = await registerUser({ name, email, password });
      const token = response.access_token;

      if (!token) {
        return { success: false, error: "Token not received" };
      }

      persistAuthTokens({
        access_token: token,
        refresh_token: response.refresh_token,
        expires_in: response.expires_in ?? 3600,
      });
      if (response.organization_id != null) {
        localStorage.setItem("organization_id", String(response.organization_id));
      }
      if (response.organization_name) {
        localStorage.setItem("organization_name", response.organization_name);
      }

      const decoded = decodeToken(token);
      const apiRole = response.role_name ?? getRoleFromToken(token);
      const mappedRole = mapApiRoleToUserRole(apiRole);

      const userData: User = {
        id: decoded.sub,
        email,
        name,
        role: mappedRole,
        accountType: (decoded.org_type === "standard" ? "standard" : "enterprise") as AccountType,
        accountId: String(decoded.organization_id ?? response.organization_id),
        organizationName: response.organization_name,
        roleName: response.role_name,
        twoFactorEnabled: false,
      };

      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      return { success: true, role: mappedRole };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setPendingUser(null);
    localStorage.removeItem("auth_user");
    clearAuthTokens();
    localStorage.removeItem("organization_id");
    localStorage.removeItem("organization_name");
    localStorage.removeItem("user_role");
    navigate("/signin", { replace: true });
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await sendOtp(email);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send verification code";
      return { success: false, error: message };
    }
  };

  const verifyResetOTP = async (email: string, code: string) => {
    try {
      await verifyOtp(email, code);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid or expired OTP code";
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      await changePassword({
        email,
        password: newPassword,
        password_confirmation: newPassword,
      });
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        verifyOTP,
        signup,
        logout,
        requestPasswordReset,
        verifyResetOTP,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}