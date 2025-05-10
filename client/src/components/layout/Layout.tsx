import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { currentUser, loading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated && !location.startsWith("/login") && !location.startsWith("/register")) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, location, navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }
  
  // Don't render layout for auth pages
  if (location.startsWith("/login") || location.startsWith("/register")) {
    return <>{children}</>;
  }
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar}
                className="text-neutral-500 mr-2"
              >
                <i className="fas fa-bars"></i>
              </button>
              <div className="flex items-center">
                <div className="bg-primary rounded-lg p-1 mr-2">
                  <i className="fas fa-chart-line text-white text-xs"></i>
                </div>
                <span className="text-lg font-semibold">TaxStats</span>
                <span className="ml-1 text-xs text-primary font-semibold py-0.5 px-1.5 rounded-md bg-blue-50">Refer2Earn</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-neutral-500">
                <i className="fas fa-bell"></i>
              </button>
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white">
                <span className="text-xs font-medium">
                  {currentUser?.displayName?.substring(0, 2) || currentUser?.username.substring(0, 2) || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
