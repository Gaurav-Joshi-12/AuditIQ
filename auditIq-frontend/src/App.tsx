import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";

// Shared pages
import RoleSelectPage from "./pages/RoleSelectPage";
import SimulationPage from "./pages/SimulationPage";
import AuthPage from "./pages/AuthPage";

// Organization pages
import OrgDashboardPage from "./pages/OrgDashboardPage";
import OrgUploadPage from "./pages/OrgUploadPage";
import OrgReportsPage from "./pages/OrgReportsPage";

// Auditor pages
import AuditorDashboardPage from "./pages/AuditorDashboardPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import UploadPage from "./pages/UploadPage";
import ExplorerPage from "./pages/ExplorerPage";
import TransactionsPage from "./pages/TransactionsPage";
import AssistantPage from "./pages/AssistantPage";
import VendorPage from "./pages/VendorPage";
import RiskPage from "./pages/RiskPage";
import ReportsPage from "./pages/ReportsPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing — no layout */}
          <Route path="/" element={<RoleSelectPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/simulation" element={<SimulationPage />} />

          {/* Organization Portal */}
          <Route path="/org/*" element={
            <AppLayout>
              <Routes>
                <Route path="/dashboard" element={<OrgDashboardPage />} />
                <Route path="/upload" element={<OrgUploadPage />} />
                <Route path="/analytics" element={<DashboardPage />} />
                <Route path="/explorer" element={<ExplorerPage />} />
                <Route path="/reports" element={<OrgReportsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          } />

          {/* Auditor Portal */}
          <Route path="/auditor/*" element={
            <AppLayout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/ingestion" element={<SubmissionsPage />} />
                <Route path="/explorer" element={<ExplorerPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/risk" element={<RiskPage />} />
                <Route path="/vendors" element={<VendorPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
