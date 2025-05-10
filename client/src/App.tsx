import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Referrals from "@/pages/referrals";
import Analytics from "@/pages/analytics";
import Rewards from "@/pages/rewards";
import Notifications from "@/pages/notifications";
import AdminDashboard from "@/pages/admin/index";
import UserManagement from "@/pages/admin/user-management";
import ApproveRewards from "@/pages/admin/approve-rewards";
import Campaigns from "@/pages/admin/campaigns";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* User Routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/notifications" component={Notifications} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/user-management" component={UserManagement} />
      <Route path="/admin/approve-rewards" component={ApproveRewards} />
      <Route path="/admin/campaigns" component={Campaigns} />
      
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
