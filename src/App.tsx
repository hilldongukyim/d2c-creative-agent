import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnalyticsProvider } from "@/hooks/useAnalytics";
import EmailGateDialog from "@/components/EmailGateDialog";
import CoverPage from "./pages/CoverPage";
import TaskOverview from "./pages/TaskOverview";
import PromotionalWorkflow from "./pages/PromotionalWorkflow";
import PipQA from "./pages/PipQA";
import AllenQA from "./pages/AllenQA";
import NotFound from "./pages/NotFound";
import Crawling from "./pages/Crawling";
import MaplePDP from "./pages/MaplePDP";
import ZoeCamera from "./pages/ZoeCamera";
import MiloECRM from "./pages/MiloECRM";
import ServerBusy from "./pages/ServerBusy";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [userEmail, setUserEmail] = useState<string | null>(
    () => localStorage.getItem("user_email")
  );

  const handleEmailSubmit = (email: string) => {
    localStorage.setItem("user_email", email);
    setUserEmail(email);
  };

  if (!isAdminRoute && !userEmail) {
    return <EmailGateDialog onSubmit={handleEmailSubmit} />;
  }

  return (
    <AnalyticsProvider>
      <Routes>
        <Route path="/" element={<CoverPage />} />
        <Route path="/promotional" element={<PromotionalWorkflow />} />
        <Route path="/tasks" element={<TaskOverview />} />
        <Route path="/pip-qa" element={<PipQA />} />
        <Route path="/allen-qa" element={<AllenQA />} />
        <Route path="/crawling" element={<Crawling />} />
        <Route path="/maple-pdp" element={<MaplePDP />} />
        <Route path="/zoe-camera/:sessionId" element={<ZoeCamera />} />
        <Route path="/milo-ecrm" element={<MiloECRM />} />
        <Route path="/server-busy" element={<ServerBusy />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnalyticsProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
