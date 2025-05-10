import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Referrals from "@/pages/referrals";
import Analytics from "@/pages/analytics";
import Rewards from "@/pages/rewards";
import Notifications from "@/pages/notifications";
import AdminDashboard from "@/pages/admin/index";
import UserManagement from "@/pages/admin/user-management";
import ApproveRewards from "@/pages/admin/approve-rewards";
import Campaigns from "@/pages/admin/campaigns";
import { useEffect } from "react";

// Protected route wrapper
const ProtectedRoute = ({ component: Component }: { component: React.ComponentType<any> }) => {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);
  
  // Show blank during auth check to prevent flash of content
  if (loading) return null;
  
  return isAuthenticated ? <Component /> : null;
};

// Admin route wrapper
const AdminRoute = ({ component: Component }: { component: React.ComponentType<any> }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setLocation("/login");
      } else if (!isAdmin) {
        setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, isAdmin, loading, setLocation]);
  
  // Show blank during auth check
  if (loading) return null;
  
  return isAuthenticated && isAdmin ? <Component /> : null;
};

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected User Routes */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/referrals" component={() => <ProtectedRoute component={Referrals} />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={Analytics} />} />
      <Route path="/rewards" component={() => <ProtectedRoute component={Rewards} />} />
      <Route path="/notifications" component={() => <ProtectedRoute component={Notifications} />} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin" component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/user-management" component={() => <AdminRoute component={UserManagement} />} />
      <Route path="/admin/approve-rewards" component={() => <AdminRoute component={ApproveRewards} />} />
      <Route path="/admin/campaigns" component={() => <AdminRoute component={Campaigns} />} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
