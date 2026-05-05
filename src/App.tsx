import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DemoModeProvider } from "@/hooks/useDemoMode";
import ProtectedRoute from "@/components/ProtectedRoute";
import GpProtectedRoute from "@/components/GpProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import NewVisitPage from "./pages/NewVisitPage";
import VisitsPage from "./pages/VisitsPage";
import VisitDetailPage from "./pages/VisitDetailPage";
import ActionsPage from "./pages/ActionsPage";
import MedicationsPage from "./pages/MedicationsPage";
import SettingsPage from "./pages/SettingsPage";
import LabResultsPage from "./pages/LabResultsPage";
import GpTodayPage from "./pages/gp/GpTodayPage";
import GpInboxPage from "./pages/gp/GpInboxPage";
import GpPatientsPage from "./pages/gp/GpPatientsPage";
import GpPatientDetailPage from "./pages/gp/GpPatientDetailPage";
import GpAnalyticsPage from "./pages/gp/GpAnalyticsPage";
import GpSettingsPage from "./pages/gp/GpSettingsPage";
import GpLoginPage from "./pages/gp/GpLoginPage";
import GpDashboardPage from "./pages/gp/GpDashboardPage";
import GpClinicPatientsPage from "./pages/gp/GpClinicPatientsPage";
import GpConsentSettingsPage from "./pages/gp/GpConsentSettingsPage";
import GpQrCodePage from "./pages/gp/GpQrCodePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DemoModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/visit/new" element={<ProtectedRoute><NewVisitPage /></ProtectedRoute>} />
            <Route path="/visits" element={<ProtectedRoute><VisitsPage /></ProtectedRoute>} />
            <Route path="/visit/:id" element={<ProtectedRoute><VisitDetailPage /></ProtectedRoute>} />
            <Route path="/actions" element={<ProtectedRoute><ActionsPage /></ProtectedRoute>} />
            <Route path="/medications" element={<ProtectedRoute><MedicationsPage /></ProtectedRoute>} />
            <Route path="/lab-results" element={<ProtectedRoute><LabResultsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* GP Portal — origin (Lovable) demo routes, no auth */}
            <Route path="/gp" element={<GpTodayPage />} />
            <Route path="/gp/inbox" element={<GpInboxPage />} />
            <Route path="/gp/patients" element={<GpPatientsPage />} />
            <Route path="/gp/patients/:id" element={<GpPatientDetailPage />} />
            <Route path="/gp/analytics" element={<GpAnalyticsPage />} />
            <Route path="/gp/settings" element={<GpSettingsPage />} />

            {/* GP Portal — spec routes (CLAUDE.md), gated by admin allowlist */}
            <Route path="/gp/login" element={<GpLoginPage />} />
            <Route path="/gp/dashboard" element={<GpProtectedRoute><GpDashboardPage /></GpProtectedRoute>} />
            <Route path="/gp/clinic-patients" element={<GpProtectedRoute><GpClinicPatientsPage /></GpProtectedRoute>} />
            <Route path="/gp/consent-settings" element={<GpProtectedRoute><GpConsentSettingsPage /></GpProtectedRoute>} />
            <Route path="/gp/qr-code" element={<GpProtectedRoute><GpQrCodePage /></GpProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </DemoModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
