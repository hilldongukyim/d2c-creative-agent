import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnalyticsProvider } from "@/hooks/useAnalytics";
import EmailGatePage from "./pages/EmailGatePage";
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const email = localStorage.getItem("user_email");
  if (!email) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <Routes>
      <Route path="/" element={<EmailGatePage />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/home" element={<ProtectedRoute><AnalyticsProvider><CoverPage /></AnalyticsProvider></ProtectedRoute>} />
      <Route path="/promotional" element={<ProtectedRoute><AnalyticsProvider><PromotionalWorkflow /></AnalyticsProvider></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><AnalyticsProvider><TaskOverview /></AnalyticsProvider></ProtectedRoute>} />
      <Route path="/pip-qa" element={<ProtectedRoute><AnalyticsProvider><PipQA /></AnalyticsProvider></ProtectedRoute>} />
      <Route path="/allen-qa" element={<ProtectedRoute><AnalyticsProvider><AllenQA /></AnalyticsProvider></ProtectedRoute>} />
      <Route path="/crawling" element={<ProtectedRoute><AnalyticsProvider><Crawling /></AnalyticsProvider></ProtectedRoute>} />
      <Route path="/maple-pdp" element={<ProtectedRoute><AnalyticsProvider><MaplePDP /></AnalyticsProvider></ProtectedRoute>} />
      <Route path="/zoe-camera/:sessionId" element={<ProtectedRoute><AnalyticsProvider><ZoeCamera /></AnalyticsProvider></ProtectedRoute>} />
      <Route path="/milo-ecrm" element={<ProtectedRoute><AnalyticsProvider><MiloECRM /></AnalyticsProvider></ProtectedRoute>} />
      <Route path="/server-busy" element={<ServerBusy />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
