import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";

// Route-level code splitting: the landing page loads eagerly for fast first
// paint, every other page is fetched on demand.
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardConversations = lazy(() => import("./pages/DashboardConversations"));
const DashboardConversationDetail = lazy(() => import("./pages/DashboardConversationDetail"));
const DashboardCallDetail = lazy(() => import("./pages/DashboardCallDetail"));
const DashboardCalls = lazy(() => import("./pages/DashboardCalls"));
const DashboardAnalytics = lazy(() => import("./pages/DashboardAnalytics"));
const DashboardKnowledgeBase = lazy(() => import("./pages/DashboardKnowledgeBase"));
const DashboardWidget = lazy(() => import("./pages/DashboardWidget"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const Demo = lazy(() => import("./pages/Demo"));
const Assessment = lazy(() => import("./pages/Assessment"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Admin = lazy(() => import("./pages/Admin"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Walkthrough = lazy(() => import("./pages/Walkthrough"));
const WidgetEmbed = lazy(() => import("./pages/WidgetEmbed"));
const WidgetLivePreview = lazy(() => import("./pages/WidgetLivePreview"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      meta: {
        onError: (error: Error) => {
          console.error("Query error:", error.message);
        },
      },
    },
  },
});

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/accept-invitation" element={<AcceptInvitation />} />
              <Route path="/walkthrough" element={<Walkthrough />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="conversations" element={<DashboardConversations />} />
                <Route path="conversations/:conversationId" element={<DashboardConversationDetail />} />
                <Route path="calls" element={<DashboardCalls />} />
                <Route path="calls/:callId" element={<DashboardCallDetail />} />
                <Route path="analytics" element={<DashboardAnalytics />} />
                <Route path="knowledge-base" element={<DashboardKnowledgeBase />} />
                <Route path="widget" element={<DashboardWidget />} />
                <Route path="settings" element={<DashboardSettings />} />
              </Route>
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                </ProtectedRoute>
              } />
              <Route path="/widget" element={<WidgetEmbed />} />
              <Route path="/widget-preview" element={
                <ProtectedRoute>
                  <WidgetLivePreview />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <CookieConsent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
