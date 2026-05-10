import React, { useState } from "react";
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { DashboardLayout } from "@/app/components/dashboard-layout";
import { DashboardHome } from "@/app/components/dashboard-home";
import { UploadContent } from "@/app/components/upload-content";
import { DistributionStatus } from "@/app/components/distribution-status";
import { AnalyticsView } from "@/app/components/analytics-view";
import { RoyaltiesView } from "@/app/components/royalties-view";
import { ReleasesView } from "@/app/components/releases-view";
import { SettingsView } from "@/app/components/settings-view";
import { PublishingView } from "@/app/components/publishing-view";
import { AudioRecognitionView } from "@/app/components/audio-recognition-view";
import { TakedownsView } from "@/app/components/takedowns-view";
import { BulkToolsView } from "@/app/components/bulk-tools-view";
import { ErrorsLogsView } from "@/app/components/errors-logs-view";
import { PartnersDSPsView } from "@/app/components/partners-dsps-view";
import { ArtistsView } from "@/app/components/artists-view";
import { ReportsView } from "@/app/components/reports-view";
import { UserManagementView } from "@/app/components/user-management-view";
import { AlertDetailsView } from "@/app/components/alert-details-view";
import { ArtistPortal } from "@/app/components/artist-portal";
import { ArtistViewerPortal } from "@/app/components/artist-viewer-portal";
import { FinancePortal } from "@/app/components/finance-portal";
import { LegalPortal } from "@/app/components/legal-portal";
import { OperationsPortal } from "@/app/components/operations-portal";
import { AdminPortal } from "@/app/components/admin-portal";
import { SuperAdminPortal } from "@/app/components/super-admin-portal";
import { Toaster } from "@/app/components/ui/sonner";
import { AuthProvider, useAuth } from "@/app/components/auth/auth-context";
import { SignIn } from "@/app/components/auth/sign-in";
import { SignUp } from "@/app/components/auth/sign-up";
import { ForgotPassword } from "@/app/components/auth/forgot-password";
import { OTPVerification } from "@/app/components/auth/otp-verification";
import { ResetPassword } from "@/app/components/auth/reset-password";
import { PrivacyPolicy } from "@/app/components/auth/privacy-policy";
import { TermsConditions } from "@/app/components/auth/terms-conditions";

type Page = 
  | "dashboard"
  | "releases"
  | "upload"
  | "distribution"
  | "publishing"
  | "royalties"
  | "analytics"
  | "audio-recognition"
  | "takedowns"
  | "bulk-tools"
  | "errors"
  | "partners"
  | "artists"
  | "reports"
  | "settings"
  | "users"
  | "alert-details";

type AuthPage = "signin" | "signup" | "forgot-password" | "reset-otp" | "reset-password" | "privacy-policy" | "terms-conditions";

function AlertDetailsRoute() {
  const { alertType } = useParams<{ alertType: string }>();
  const navigate = useNavigate();
  return <AlertDetailsView alertType={alertType ?? ""} onBack={() => navigate("/dashboard")} />;
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [authPage, setAuthPage] = useState<AuthPage>("signin");
  const [resetEmail, setResetEmail] = useState("");
  const [pageParams, setPageParams] = useState<any>({});

  // When unauthenticated, keep auth page in sync with URL so no protected route is "remembered"
  React.useEffect(() => {
    if (!isAuthenticated && location.pathname) {
      if (location.pathname === "/signup") setAuthPage("signup");
      else if (location.pathname === "/forgot-password") setAuthPage("forgot-password");
      else if (location.pathname === "/signin" || location.pathname === "/") setAuthPage("signin");
    }
  }, [isAuthenticated, location.pathname]);

  /** No window scrollbar: scroll only inside portal layouts (e.g. artist main column). */
  React.useEffect(() => {
    if (!isAuthenticated) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.classList.add("scrollbar-hide");
    body.classList.add("scrollbar-hide");
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.classList.remove("scrollbar-hide");
      body.classList.remove("scrollbar-hide");
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [isAuthenticated]);

  const handleAuthNavigate = (page: AuthPage) => {
    setAuthPage(page);
    if (page === "signup") navigate("/signup", { replace: true });
    else if (page === "signin") navigate("/signin", { replace: true });
    else if (page === "forgot-password") navigate("/forgot-password", { replace: true });
  };

  const dashboardNavigate = (page: string, params?: any) => {
    if (page === "alert-details" && params?.alertType) navigate(`/alert-details/${params.alertType}`);
    else navigate(`/${page}`);
  };

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page as Page);
    if (params) {
      setPageParams(params);
    } else {
      setPageParams({});
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardHome onNavigate={handleNavigate} />;
      case "releases":
        return <ReleasesView />;
      case "upload":
        return <UploadContent />;
      case "distribution":
        return <DistributionStatus />;
      case "analytics":
        return <AnalyticsView />;
      case "royalties":
        return <RoyaltiesView />;
      case "settings":
        return <SettingsView />;
      case "publishing":
        return <PublishingView />;
      case "audio-recognition":
        return <AudioRecognitionView />;
      case "takedowns":
        return <TakedownsView />;
      case "bulk-tools":
        return <BulkToolsView />;
      case "errors":
        return <ErrorsLogsView />;
      case "partners":
        return <PartnersDSPsView />;
      case "artists":
        return <ArtistsView />;
      case "reports":
        return <ReportsView />;
      case "users":
        return <UserManagementView />;
      case "alert-details":
        return <AlertDetailsView alertType={pageParams.alertType} onBack={() => handleNavigate("dashboard")} />;
      default:
        return <DashboardHome onNavigate={handleNavigate} />;
    }
  };

  // Show authentication pages if not logged in
  if (!isAuthenticated) {
    switch (authPage) {
      case "signin":
        return (
          <SignIn
            onNavigate={handleAuthNavigate}
            onSuccess={() => setCurrentPage("dashboard")}
          />
        );
      case "signup":
        return (
          <SignUp
            onNavigate={handleAuthNavigate}
            onSuccess={() => setCurrentPage("dashboard")}
          />
        );
      case "forgot-password":
        return (
          <ForgotPassword
            onNavigate={handleAuthNavigate}
            onEmailSubmitted={(email) => setResetEmail(email)}
          />
        );
      case "reset-otp":
        return (
          <OTPVerification
            mode="reset"
            email={resetEmail}
            onNavigate={handleAuthNavigate}
            onSuccess={() => setAuthPage("signin")}
            onResetVerified={() => setAuthPage("reset-password")}
          />
        );
      case "reset-password":
        return (
          <ResetPassword
            email={resetEmail}
            onSuccess={() => setAuthPage("signin")}
          />
        );
      case "privacy-policy":
        return (
          <PrivacyPolicy
            onNavigate={handleAuthNavigate}
          />
        );
      case "terms-conditions":
        return (
          <TermsConditions
            onNavigate={handleAuthNavigate}
          />
        );
    }
  }

  return (
    <div className="flex min-h-0 h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      {/* Route based on user role */}
      {user?.role === "platform-super-admin" ? (
        <>
          <Routes>
            <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="/super-admin/:tab" element={<SuperAdminPortal />} />
            <Route path="*" element={<Navigate to="/super-admin/dashboard" replace />} />
          </Routes>
          <Toaster />
        </>
      ) : user?.role === "admin" || user?.role === "organization_admin" ? (
        <>
          <Routes>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/:tab" element={<AdminPortal />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
          <Toaster />
        </>
      ) : user?.role === "finance" ? (
        <>
          <Routes>
            <Route path="/finance" element={<Navigate to="/finance/dashboard" replace />} />
            <Route path="/finance/:tab" element={<FinancePortal />} />
            <Route path="*" element={<Navigate to="/finance/dashboard" replace />} />
          </Routes>
          <Toaster />
        </>
      ) : user?.role === "legal" ? (
        <>
          <Routes>
            <Route path="/legal" element={<Navigate to="/legal/dashboard" replace />} />
            <Route path="/legal/:tab" element={<LegalPortal />} />
            <Route path="*" element={<Navigate to="/legal/dashboard" replace />} />
          </Routes>
          <Toaster />
        </>
      ) : user?.role === "operations" ? (
        <>
          <Routes>
            <Route path="/operations" element={<Navigate to="/operations/dashboard" replace />} />
            <Route path="/operations/:tab" element={<OperationsPortal />} />
            <Route path="*" element={<Navigate to="/operations/dashboard" replace />} />
          </Routes>
          <Toaster />
        </>
      ) : user?.role === "artist-owner" ? (
        <>
          <Routes>
            <Route path="/artist" element={<Navigate to="/artist/dashboard" replace />} />
            <Route path="/artist/releases/:releaseId/distribute" element={<ArtistPortal />} />
            <Route path="/artist/:tab" element={<ArtistPortal />} />
            <Route path="*" element={<Navigate to="/artist/dashboard" replace />} />
          </Routes>
          <Toaster />
        </>
      ) : user?.role === "artist-viewer" ? (
        <>
          <Routes>
            <Route path="/artist" element={<Navigate to="/artist/dashboard" replace />} />
            <Route path="/artist/releases/:releaseId/distribute" element={<ArtistViewerPortal />} />
            <Route path="/artist/:tab" element={<ArtistViewerPortal />} />
            <Route path="*" element={<Navigate to="/artist/dashboard" replace />} />
          </Routes>
          <Toaster />
        </>
      ) : user?.role === "account-owner" || user?.role === "viewer" ? (
        <>
          <Routes>
            <Route path="/artist" element={<Navigate to="/artist/dashboard" replace />} />
            <Route path="/artist/releases/:releaseId/distribute" element={<ArtistPortal />} />
            <Route path="/artist/:tab" element={<ArtistPortal />} />
            <Route path="*" element={<Navigate to="/artist/dashboard" replace />} />
          </Routes>
          <Toaster />
        </>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardLayout><DashboardHome onNavigate={dashboardNavigate} /></DashboardLayout>} />
            <Route path="/releases" element={<DashboardLayout><ReleasesView /></DashboardLayout>} />
            <Route path="/upload" element={<DashboardLayout><UploadContent /></DashboardLayout>} />
            <Route path="/distribution" element={<DashboardLayout><DistributionStatus /></DashboardLayout>} />
            <Route path="/analytics" element={<DashboardLayout><AnalyticsView /></DashboardLayout>} />
            <Route path="/royalties" element={<DashboardLayout><RoyaltiesView /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><SettingsView /></DashboardLayout>} />
            <Route path="/publishing" element={<DashboardLayout><PublishingView /></DashboardLayout>} />
            <Route path="/audio-recognition" element={<DashboardLayout><AudioRecognitionView /></DashboardLayout>} />
            <Route path="/takedowns" element={<DashboardLayout><TakedownsView /></DashboardLayout>} />
            <Route path="/bulk-tools" element={<DashboardLayout><BulkToolsView /></DashboardLayout>} />
            <Route path="/errors" element={<DashboardLayout><ErrorsLogsView /></DashboardLayout>} />
            <Route path="/partners" element={<DashboardLayout><PartnersDSPsView /></DashboardLayout>} />
            <Route path="/artists" element={<DashboardLayout><ArtistsView /></DashboardLayout>} />
            <Route path="/reports" element={<DashboardLayout><ReportsView /></DashboardLayout>} />
            <Route path="/users" element={<DashboardLayout><UserManagementView /></DashboardLayout>} />
            <Route path="/alert-details/:alertType" element={<DashboardLayout><AlertDetailsRoute /></DashboardLayout>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}